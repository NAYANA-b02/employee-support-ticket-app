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

  await t.test('9. Sorting by createdDate: Newest First and Oldest First', () => {
    const newestIds = ['TICK-103', 'TICK-102', 'TICK-101', 'TICK-105', 'TICK-104'];
    const oldestIds = ['TICK-104', 'TICK-105', 'TICK-101', 'TICK-102', 'TICK-103'];

    const newest = store.getTickets({ role: 'Support Staff', sort: 'newest' });
    assert.deepStrictEqual(newest.map(ticket => ticket.id), newestIds);

    const oldest = store.getTickets({ role: 'Support Staff', sort: 'oldest' });
    assert.deepStrictEqual(oldest.map(ticket => ticket.id), oldestIds);

    const defaultOrder = store.getTickets({ role: 'Support Staff' });
    assert.deepStrictEqual(defaultOrder.map(ticket => ticket.id), newestIds, 'Missing sort defaults to newest');

    const sample = store.loadTickets()[0];
    assert.ok(sample.createdDate);
    assert.ok(Array.isArray(sample.comments));
    assert.strictEqual(Object.prototype.hasOwnProperty.call(sample, 'assignedTo'), false);
  });

  await t.test('10. Sorting works together with search, category, priority, and status filters', () => {
    const hardwareNewest = store.getTickets({
      role: 'Support Staff',
      category: 'Hardware',
      sort: 'newest'
    });
    assert.deepStrictEqual(hardwareNewest.map(ticket => ticket.id), ['TICK-101', 'TICK-105']);

    const hardwareOldest = store.getTickets({
      role: 'Support Staff',
      category: 'Hardware',
      priority: 'High',
      status: 'Open',
      sort: 'oldest'
    });
    assert.deepStrictEqual(hardwareOldest.map(ticket => ticket.id), ['TICK-101']);

    const priyaNewest = store.getTickets({
      role: 'Support Staff',
      search: 'Priya',
      sort: 'newest'
    });
    assert.deepStrictEqual(priyaNewest.map(ticket => ticket.id), ['TICK-102', 'TICK-105']);

    const priyaOldest = store.getTickets({
      role: 'Support Staff',
      search: 'Priya',
      sort: 'oldest'
    });
    assert.deepStrictEqual(priyaOldest.map(ticket => ticket.id), ['TICK-105', 'TICK-102']);

    const raviOpenOldest = store.getTickets({
      user: 'Ravi',
      role: 'Employee',
      status: 'Open',
      sort: 'oldest'
    });
    assert.deepStrictEqual(raviOpenOldest.map(ticket => ticket.id), ['TICK-101', 'TICK-103']);
    assert.ok(raviOpenOldest.every(ticket => ticket.createdBy === 'Ravi' && ticket.status === 'Open'));
  });

  await t.test('11. Invalid sort values are rejected', () => {
    assert.throws(
      () => store.getTickets({ role: 'Support Staff', sort: 'alphabetical' }),
      err => err.statusCode === 400 && err.message.includes('Sort must be one of')
    );

    assert.throws(
      () => store.getTickets({ role: 'Support Staff', sort: 'Newest First' }),
      err => err.statusCode === 400 && err.message.includes('Sort must be one of')
    );

    assert.throws(
      () => store.getTickets({ role: 'Support Staff', category: 'Hardware', sort: 'date' }),
      err => err.statusCode === 400
    );
  });

  await t.test('12. Date parsing and invalid date handling in sorting', () => {
    // Valid standard date format returns valid positive timestamp
    const t1 = store.parseCreatedDate('18 Nov 2026, 09:30 AM');
    assert.ok(t1 > 0, 'Valid date returns positive timestamp');

    // Invalid, malformed, or missing date strings return 0 without throwing
    assert.strictEqual(store.parseCreatedDate('invalid-date'), 0);
    assert.strictEqual(store.parseCreatedDate(''), 0);
    assert.strictEqual(store.parseCreatedDate(null), 0);
    assert.strictEqual(store.parseCreatedDate(undefined), 0);
    assert.strictEqual(store.parseCreatedDate('99 Nov 2026, 25:99 PM'), 0);

    // ISO format fallback returns positive timestamp
    const isoTime = store.parseCreatedDate('2026-11-18T09:30:00.000Z');
    assert.ok(isoTime > 0, 'ISO date fallback parses successfully');

    // Sorting continues to operate gracefully when tickets contain invalid dates
    const testTickets = [
      { id: 'TICK-A', title: 'Ticket with invalid date', category: 'Other', priority: 'Low', status: 'Open', createdBy: 'Ravi', createdDate: 'invalid-date' },
      { id: 'TICK-B', title: 'Ticket with valid date', category: 'Other', priority: 'Low', status: 'Open', createdBy: 'Ravi', createdDate: '18 Nov 2026, 10:00 AM' }
    ];
    store.saveTickets(testTickets);

    const newest = store.getTickets({ user: 'Ravi', role: 'Employee', sort: 'newest' });
    assert.strictEqual(newest[0].id, 'TICK-B', 'Valid date appears first when sorting newest');

    const oldest = store.getTickets({ user: 'Ravi', role: 'Employee', sort: 'oldest' });
    assert.strictEqual(oldest[0].id, 'TICK-A', 'Fallback zero-timestamp appears first when sorting oldest');

    store.resetTickets();
  });
});
