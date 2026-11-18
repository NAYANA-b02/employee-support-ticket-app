// test/tickets.test.js
// Automated test suite for Employee Support Ticket Management Application.
// Uses Node.js native test runner (node:test).

const test = require('node:test');
const assert = require('node:assert');
const store = require('../ticketsStore.js');

test('Employee Support Ticket Application Tests', async (t) => {

  t.beforeEach(() => {
    store.resetTickets();
  });

  await t.test('1. Pre-populated sample tickets match specifications', () => {
    const all = store.getTickets({ role: 'Support Staff' });
    assert.strictEqual(all.length, 5, 'Should have exactly 5 initial sample tickets');

    const t1 = all.find(t => t.id === 'TICK-101');
    assert.ok(t1, 'Ticket 1 exists');
    assert.strictEqual(t1.title, 'Laptop not charging');
    assert.strictEqual(t1.category, 'Hardware');
    assert.strictEqual(t1.priority, 'High');
    assert.strictEqual(t1.status, 'Open');
    assert.strictEqual(t1.createdBy, 'Ravi');

    const t2 = all.find(t => t.id === 'TICK-102');
    assert.ok(t2, 'Ticket 2 exists');
    assert.strictEqual(t2.status, 'In Progress');
    assert.strictEqual(t2.createdBy, 'Priya');

    const t4 = all.find(t => t.id === 'TICK-104');
    assert.strictEqual(t4.status, 'Resolved');
    assert.strictEqual(t4.createdBy, 'Alex');

    const t5 = all.find(t => t.id === 'TICK-105');
    assert.strictEqual(t5.status, 'Closed');
    assert.strictEqual(t5.createdBy, 'Priya');
  });

  await t.test('2. Role-based visibility: Employee sees own tickets; Support Staff sees all', () => {
    const raviTickets = store.getTickets({ user: 'Ravi', role: 'Employee' });
    assert.strictEqual(raviTickets.length, 2, 'Ravi should only see 2 tickets');
    assert.ok(raviTickets.every(t => t.createdBy === 'Ravi'));

    const priyaTickets = store.getTickets({ user: 'Priya', role: 'Employee' });
    assert.strictEqual(priyaTickets.length, 2, 'Priya should only see 2 tickets');
    assert.ok(priyaTickets.every(t => t.createdBy === 'Priya'));

    const supportTickets = store.getTickets({ user: 'Sam', role: 'Support Staff' });
    assert.strictEqual(supportTickets.length, 5, 'Support Staff sees all 5 tickets');
  });

  await t.test('3. Ticket Creation: Enforces validation, sets Open status and auto dates', () => {
    const created = store.createTicket({
      title: 'Wireless mouse not pairing',
      description: 'Bluetooth fails to recognize mouse device.',
      category: 'Hardware',
      priority: 'Low',
      createdBy: 'Ravi'
    });

    assert.ok(created.id.startsWith('TICK-'));
    assert.strictEqual(created.title, 'Wireless mouse not pairing');
    assert.strictEqual(created.status, 'Open', 'New ticket must start in Open status');
    assert.strictEqual(created.createdBy, 'Ravi');
    assert.ok(created.createdDate);
    assert.ok(created.lastUpdatedDate);

    // Validation: empty title fails
    assert.throws(
      () => store.createTicket({ title: '   ', description: 'Desc', category: 'Hardware', priority: 'Low', createdBy: 'Ravi' }),
      err => err.statusCode === 400 && err.message.includes('Title is required')
    );

    // Validation: title > 100 characters fails
    assert.throws(
      () => store.createTicket({ title: 'X'.repeat(101), description: 'Desc', category: 'Hardware', priority: 'Low', createdBy: 'Ravi' }),
      err => err.statusCode === 400 && err.message.includes('cannot exceed 100 characters')
    );

    // Validation: empty description fails
    assert.throws(
      () => store.createTicket({ title: 'Valid title', description: '   ', category: 'Hardware', priority: 'Low', createdBy: 'Ravi' }),
      err => err.statusCode === 400 && err.message.includes('Description is required')
    );
  });

  await t.test('4. Ticket Editing: Only creator can edit when not Closed; Closed tickets cannot be edited', () => {
    // Ravi edits his open ticket TICK-101 -> succeeds
    const updated = store.updateTicket(
      'TICK-101',
      { title: 'Laptop not charging (urgent)' },
      { user: 'Ravi', role: 'Employee' }
    );
    assert.strictEqual(updated.title, 'Laptop not charging (urgent)');

    // Priya tries to edit Ravi's ticket -> forbidden (403)
    assert.throws(
      () => store.updateTicket('TICK-101', { title: 'Hack' }, { user: 'Priya', role: 'Employee' }),
      err => err.statusCode === 403
    );

    // Support Staff tries to edit employee's original request fields -> forbidden (403)
    assert.throws(
      () => store.updateTicket('TICK-101', { title: 'Staff Edit' }, { user: 'Sam', role: 'Support Staff' }),
      err => err.statusCode === 403
    );

    // Priya tries to edit her Closed ticket TICK-105 -> bad request (400)
    assert.throws(
      () => store.updateTicket('TICK-105', { title: 'New Monitor Title' }, { user: 'Priya', role: 'Employee' }),
      err => err.statusCode === 400 && err.message.includes('Closed ticket cannot be edited')
    );
  });

  await t.test('5. Status Management: Only Support Staff can change status', () => {
    // Employee tries to change status -> forbidden (403)
    assert.throws(
      () => store.updateStatus('TICK-101', 'In Progress', { role: 'Employee' }),
      err => err.statusCode === 403 && err.message.includes('Only support staff')
    );

    // Support Staff changes status -> succeeds
    const updated = store.updateStatus('TICK-101', 'In Progress', { role: 'Support Staff' });
    assert.strictEqual(updated.status, 'In Progress');
  });

  await t.test('6. Comments: Both roles can add comments, including on Closed tickets', () => {
    // Add comment to open ticket
    const c1 = store.addComment('TICK-101', 'Following up on this.', { author: 'Ravi', role: 'Employee' });
    assert.ok(c1.id);
    assert.strictEqual(c1.author, 'Ravi');

    // Add comment to CLOSED ticket TICK-105 -> succeeds!
    const c2 = store.addComment('TICK-105', 'Closing note: confirmed resolved.', { author: 'Sam', role: 'Support Staff' });
    assert.ok(c2.id);
    assert.strictEqual(c2.text, 'Closing note: confirmed resolved.');

    const ticket = store.getTicketById('TICK-105');
    assert.strictEqual(ticket.comments.length, 1);
    assert.strictEqual(ticket.comments[0].text, 'Closing note: confirmed resolved.');
  });

  await t.test('7. Search and Filtering', () => {
    // Filter by category: Hardware in Support Staff view -> 2 tickets (TICK-101 and TICK-105)
    const hardware = store.getTickets({ role: 'Support Staff', category: 'Hardware' });
    assert.strictEqual(hardware.length, 2);

    // Search by keyword "VPN" -> TICK-102
    const searchVpn = store.getTickets({ role: 'Support Staff', search: 'VPN' });
    assert.strictEqual(searchVpn.length, 1);
    assert.strictEqual(searchVpn[0].id, 'TICK-102');

    // Search by ID "TICK-104"
    const searchId = store.getTickets({ role: 'Support Staff', search: 'TICK-104' });
    assert.strictEqual(searchId.length, 1);
    assert.strictEqual(searchId[0].title, 'Excel keeps crashing on startup');
  });

  await t.test('8. Reset Demo Data restores initial 5 tickets', () => {
    store.createTicket({ title: 'Temporary', description: 'Temp', category: 'Other', priority: 'Low', createdBy: 'Ravi' });
    assert.strictEqual(store.getTickets({ role: 'Support Staff' }).length, 6);

    store.resetTickets();
    assert.strictEqual(store.getTickets({ role: 'Support Staff' }).length, 5);
  });
});
