// ticketsStore.js
// Simple data storage and business logic for the Employee Support Ticket Application.
// Uses Node.js built-in modules only.

const fs = require('fs');
const path = require('path');

// File paths for ticket data
const DATA_DIR = path.join(__dirname, 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const SAMPLE_TICKETS_FILE = path.join(DATA_DIR, 'sampleTickets.json');

// Constants
const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const SORT_OPTIONS = ['newest', 'oldest'];

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

// Fixed 5 fictional personas for demonstration
const USERS = [
  { id: 'u1', name: 'Ravi', role: 'Employee', title: 'Software Engineer', avatar: '👨‍💻' },
  { id: 'u2', name: 'Priya', role: 'Employee', title: 'Product Designer', avatar: '👩‍🎨' },
  { id: 'u3', name: 'Alex', role: 'Employee', title: 'Marketing Lead', avatar: '🧑‍💼' },
  { id: 'u4', name: 'Sam', role: 'Support Staff', title: 'IT Support Specialist', avatar: '🛠️' },
  { id: 'u5', name: 'Sarah', role: 'Support Staff', title: 'Senior Helpdesk Lead', avatar: '👩‍🔧' }
];

/**
 * Returns formatted date string matching SPEC.md: "18 Nov 2026, 09:30 AM"
 */
function formatDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');
  return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
}

/**
 * Loads all tickets from data/tickets.json.
 */
function loadTickets() {
  try {
    if (fs.existsSync(TICKETS_FILE)) {
      const fileData = fs.readFileSync(TICKETS_FILE, 'utf8');
      return JSON.parse(fileData);
    }
    return resetTickets();
  } catch (error) {
    console.error('Error loading tickets. Resetting to sample data...', error.message);
    return resetTickets();
  }
}

/**
 * Saves tickets array to data/tickets.json.
 */
function saveTickets(tickets) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const jsonData = JSON.stringify(tickets, null, 2);
    fs.writeFileSync(TICKETS_FILE, jsonData, 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving tickets:', error.message);
    throw error;
  }
}

/**
 * Resets tickets to the original sample tickets.
 */
function resetTickets() {
  try {
    const sampleData = fs.readFileSync(SAMPLE_TICKETS_FILE, 'utf8');
    const tickets = JSON.parse(sampleData);
    saveTickets(tickets);
    return tickets;
  } catch (error) {
    console.error('Error resetting tickets:', error.message);
    return [];
  }
}

/**
 * Returns list of fictional users.
 */
function getUsers() {
  return USERS;
}

/**
 * Finds user by persona ID or name.
 */
function findUser(identifier) {
  if (!identifier) return USERS[0]; // Default to Ravi
  return USERS.find(u => u.id === identifier || u.name.toLowerCase() === identifier.toLowerCase()) || USERS[0];
}

/**
 * Parses the stored createdDate string ("18 Nov 2026, 09:30 AM") into a timestamp.
 * Returns 0 when the value cannot be parsed so sorting still completes.
 */
function parseCreatedDate(value) {
  if (!value || typeof value !== 'string') return 0;
  const match = value.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
  if (!match) {
    const fallback = Date.parse(value);
    return Number.isNaN(fallback) ? 0 : fallback;
  }

  const day = parseInt(match[1], 10);
  const month = MONTHS[match[2].toLowerCase()];
  const year = parseInt(match[3], 10);
  let hours = parseInt(match[4], 10);
  const minutes = parseInt(match[5], 10);
  const ampm = match[6].toUpperCase();

  if (month === undefined) return 0;
  if (day < 1 || day > 31) return 0;
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return 0;

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const time = new Date(year, month, day, hours, minutes, 0, 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Gets tickets filtered by role visibility and query parameters, then sorted by createdDate.
 * Rule: Employee sees only their own tickets; Support Staff see all tickets.
 * Sort: "newest" (default) or "oldest". Invalid values are rejected.
 */
function getTickets({ user = 'Ravi', role = 'Employee', search = '', category = 'All', priority = 'All', status = 'All', sort = 'newest' } = {}) {
  let tickets = loadTickets();

  // Business Rule: Employee sees only their own tickets
  if (role === 'Employee') {
    tickets = tickets.filter(t => t.createdBy.toLowerCase() === user.toLowerCase());
  }

  // Filter by category
  if (category && category !== 'All') {
    tickets = tickets.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by priority
  if (priority && priority !== 'All') {
    tickets = tickets.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
  }

  // Filter by status
  if (status && status !== 'All') {
    tickets = tickets.filter(t => t.status.toLowerCase() === status.toLowerCase());
  }

  // Search in title, description, id, createdBy
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    tickets = tickets.filter(t =>
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.createdBy.toLowerCase().includes(q)
    );
  }

  const sortKey = String(sort == null ? '' : sort).trim().toLowerCase();
  const normalizedSort = sortKey === '' ? 'newest' : sortKey;
  if (!SORT_OPTIONS.includes(normalizedSort)) {
    const err = new Error(`Sort must be one of: ${SORT_OPTIONS.join(', ')}.`);
    err.statusCode = 400;
    throw err;
  }

  tickets.sort((a, b) => {
    const diff = parseCreatedDate(a.createdDate) - parseCreatedDate(b.createdDate);
    if (diff !== 0) {
      return normalizedSort === 'oldest' ? diff : -diff;
    }
    return normalizedSort === 'oldest' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
  });

  return tickets;
}

/**
 * Finds a single ticket by ID.
 */
function getTicketById(id) {
  const tickets = loadTickets();
  return tickets.find(t => t.id === id) || null;
}

/**
 * Creates a new ticket.
 * Validation: Title required (max 100 chars), Description required.
 * Auto-assigned: status = 'Open', createdDate, lastUpdatedDate, next TICK-XXX id.
 */
function createTicket({ title, description, category, priority, createdBy }) {
  if (!title || !title.trim()) {
    const err = new Error('Title is required and cannot be empty.');
    err.statusCode = 400;
    throw err;
  }
  const cleanTitle = title.trim();
  if (cleanTitle.length > 100) {
    const err = new Error('Title cannot exceed 100 characters.');
    err.statusCode = 400;
    throw err;
  }

  if (!description || !description.trim()) {
    const err = new Error('Description is required and cannot be empty.');
    err.statusCode = 400;
    throw err;
  }

  if (!category || !CATEGORIES.includes(category)) {
    const err = new Error(`Category must be one of: ${CATEGORIES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  if (!priority || !PRIORITIES.includes(priority)) {
    const err = new Error(`Priority must be one of: ${PRIORITIES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const tickets = loadTickets();

  // Generate next ticket ID (e.g. TICK-106)
  let maxIdNum = 100;
  for (const t of tickets) {
    const match = t.id.match(/^TICK-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  }
  const newId = `TICK-${maxIdNum + 1}`;
  const nowFormatted = formatDate();

  const newTicket = {
    id: newId,
    title: cleanTitle,
    description: description.trim(),
    category,
    priority,
    status: 'Open', // Newly created tickets always start in Open status
    createdBy: createdBy || 'Ravi',
    createdDate: nowFormatted,
    lastUpdatedDate: nowFormatted,
    comments: []
  };

  tickets.unshift(newTicket);
  saveTickets(tickets);
  return newTicket;
}

/**
 * Updates an existing ticket's fields (Title, Description, Category, Priority).
 * Rule: Only the employee who created the ticket can edit it, and only while it is NOT Closed.
 */
function updateTicket(id, updates, { user, role }) {
  const tickets = loadTickets();
  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    const err = new Error('Ticket not found.');
    err.statusCode = 404;
    throw err;
  }

  // Rule: Support staff cannot edit original request fields
  if (role === 'Support Staff') {
    const err = new Error('Support staff manage status and comments, but cannot edit original ticket fields.');
    err.statusCode = 403;
    throw err;
  }

  // Rule: Only the creator employee can edit
  if (role === 'Employee' && ticket.createdBy.toLowerCase() !== user.toLowerCase()) {
    const err = new Error('Only the employee who created the ticket can edit it.');
    err.statusCode = 403;
    throw err;
  }

  // Rule: A Closed ticket cannot be edited
  if (ticket.status === 'Closed') {
    const err = new Error('A Closed ticket cannot be edited. Comments can still be added.');
    err.statusCode = 400;
    throw err;
  }

  // Validate updates
  if (updates.title !== undefined) {
    const cleanTitle = String(updates.title).trim();
    if (!cleanTitle) {
      const err = new Error('Title cannot be empty.');
      err.statusCode = 400;
      throw err;
    }
    if (cleanTitle.length > 100) {
      const err = new Error('Title cannot exceed 100 characters.');
      err.statusCode = 400;
      throw err;
    }
    ticket.title = cleanTitle;
  }

  if (updates.description !== undefined) {
    const cleanDesc = String(updates.description).trim();
    if (!cleanDesc) {
      const err = new Error('Description cannot be empty.');
      err.statusCode = 400;
      throw err;
    }
    ticket.description = cleanDesc;
  }

  if (updates.category !== undefined) {
    if (!CATEGORIES.includes(updates.category)) {
      const err = new Error(`Category must be one of: ${CATEGORIES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    ticket.category = updates.category;
  }

  if (updates.priority !== undefined) {
    if (!PRIORITIES.includes(updates.priority)) {
      const err = new Error(`Priority must be one of: ${PRIORITIES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    ticket.priority = updates.priority;
  }

  // Update timestamp
  ticket.lastUpdatedDate = formatDate();
  saveTickets(tickets);
  return ticket;
}

/**
 * Updates a ticket's status.
 * Rule: Only Support Staff can change a ticket's status.
 */
function updateStatus(id, newStatus, { role }) {
  const tickets = loadTickets();
  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    const err = new Error('Ticket not found.');
    err.statusCode = 404;
    throw err;
  }

  // Rule: Only support staff can change a ticket's status
  if (role !== 'Support Staff') {
    const err = new Error('Only support staff can change a ticket\'s status.');
    err.statusCode = 403;
    throw err;
  }

  if (!STATUSES.includes(newStatus)) {
    const err = new Error(`Status must be one of: ${STATUSES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  ticket.status = newStatus;
  ticket.lastUpdatedDate = formatDate();
  saveTickets(tickets);
  return ticket;
}

/**
 * Adds a comment to a ticket.
 * Rule: Both roles can add comments, even on Closed tickets!
 */
function addComment(id, text, { author, role }) {
  const tickets = loadTickets();
  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    const err = new Error('Ticket not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!text || !text.trim()) {
    const err = new Error('Comment text cannot be empty.');
    err.statusCode = 400;
    throw err;
  }

  const newComment = {
    id: `c_${Date.now()}`,
    author: author || 'Anonymous',
    role: role || 'Employee',
    text: text.trim(),
    createdAt: formatDate()
  };

  if (!ticket.comments) {
    ticket.comments = [];
  }

  ticket.comments.push(newComment);
  ticket.lastUpdatedDate = formatDate();
  saveTickets(tickets);
  return newComment;
}

module.exports = {
  loadTickets,
  saveTickets,
  resetTickets,
  getUsers,
  findUser,
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateStatus,
  addComment,
  formatDate,
  parseCreatedDate,
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  SORT_OPTIONS,
  TICKETS_FILE,
  SAMPLE_TICKETS_FILE
};
