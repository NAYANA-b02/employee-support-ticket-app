// server.js - Employee Support Ticket Management Application
// Lightweight HTTP server and REST API using standard Node.js built-in modules.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const store = require('./ticketsStore.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

// Helper to send JSON responses
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

// Helper to parse JSON request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        const error = new Error('Invalid JSON format');
        error.statusCode = 400;
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// Resolves active demo persona from request headers or query params
function getPersona(req, parsedUrl) {
  const personaId = req.headers['x-persona-id'] || parsedUrl.searchParams.get('personaId') || 'u1';
  return store.findUser(personaId);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Persona-Id'
    });
    res.end();
    return;
  }

  try {
    // -------------------------------------------------------------
    // API Routes
    // -------------------------------------------------------------

    // 1. Get users and options (for persona switcher & dropdowns)
    if (pathname === '/api/users' && method === 'GET') {
      return sendJSON(res, 200, {
        users: store.getUsers(),
        categories: store.CATEGORIES,
        priorities: store.PRIORITIES,
        statuses: store.STATUSES
      });
    }

    // 2. Get tickets (filtered by active persona role & search/filter params)
    if (pathname === '/api/tickets' && method === 'GET') {
      const persona = getPersona(req, parsedUrl);
      const search = parsedUrl.searchParams.get('search') || '';
      const category = parsedUrl.searchParams.get('category') || 'All';
      const priority = parsedUrl.searchParams.get('priority') || 'All';
      const status = parsedUrl.searchParams.get('status') || 'All';
      const sort = parsedUrl.searchParams.get('sort') || 'newest';

      const tickets = store.getTickets({
        user: persona.name,
        role: persona.role,
        search,
        category,
        priority,
        status,
        sort
      });

      return sendJSON(res, 200, {
        tickets,
        activePersona: persona
      });
    }

    // 3. Create a new ticket
    if (pathname === '/api/tickets' && method === 'POST') {
      const body = await parseBody(req);
      const persona = getPersona(req, parsedUrl);
      const newTicket = store.createTicket({
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority,
        createdBy: persona.name
      });
      return sendJSON(res, 201, {
        message: 'Ticket created successfully.',
        ticket: newTicket
      });
    }

    // 4. Single ticket operations: /api/tickets/:id
    const singleTicketMatch = pathname.match(/^\/api\/tickets\/([A-Za-z0-9_-]+)$/);
    if (singleTicketMatch) {
      const ticketId = singleTicketMatch[1];
      const persona = getPersona(req, parsedUrl);

      if (method === 'GET') {
        const ticket = store.getTicketById(ticketId);
        if (!ticket) {
          return sendJSON(res, 404, { error: 'Ticket not found.' });
        }
        // Visibility rule: Employee sees only their own tickets
        if (persona.role === 'Employee' && ticket.createdBy.toLowerCase() !== persona.name.toLowerCase()) {
          return sendJSON(res, 403, { error: 'Access denied: You can only view your own tickets.' });
        }
        return sendJSON(res, 200, { ticket });
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        const updated = store.updateTicket(ticketId, body, {
          user: persona.name,
          role: persona.role
        });
        return sendJSON(res, 200, {
          message: 'Ticket updated successfully.',
          ticket: updated
        });
      }
    }

    // 5. Status update: /api/tickets/:id/status (Support Staff only)
    const statusMatch = pathname.match(/^\/api\/tickets\/([A-Za-z0-9_-]+)\/status$/);
    if (statusMatch && (method === 'PATCH' || method === 'PUT')) {
      const ticketId = statusMatch[1];
      const body = await parseBody(req);
      const persona = getPersona(req, parsedUrl);
      const updated = store.updateStatus(ticketId, body.status, {
        role: persona.role
      });
      return sendJSON(res, 200, {
        message: `Status updated to ${body.status}.`,
        ticket: updated
      });
    }

    // 6. Add comment: /api/tickets/:id/comments
    const commentMatch = pathname.match(/^\/api\/tickets\/([A-Za-z0-9_-]+)\/comments$/);
    if (commentMatch && method === 'POST') {
      const ticketId = commentMatch[1];
      const body = await parseBody(req);
      const persona = getPersona(req, parsedUrl);
      const comment = store.addComment(ticketId, body.text, {
        author: persona.name,
        role: persona.role
      });
      return sendJSON(res, 201, {
        message: 'Comment added.',
        comment
      });
    }

    // 7. Reset sample tickets
    if (pathname === '/api/reset' && method === 'POST') {
      const tickets = store.resetTickets();
      return sendJSON(res, 200, {
        message: 'Sample data reset successfully.',
        count: tickets.length
      });
    }

    // -------------------------------------------------------------
    // Static File Serving (from public/ folder)
    // -------------------------------------------------------------
    if (method === 'GET') {
      let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
      if (safePath === '/' || safePath === '\\') {
        safePath = '/index.html';
      }
      const filePath = path.join(PUBLIC_DIR, safePath);

      // Verify file is within PUBLIC_DIR
      if (filePath.startsWith(PUBLIC_DIR) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const fileContent = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        return res.end(fileContent);
      }
    }

    // Not found
    sendJSON(res, 404, { error: 'Route not found.' });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    sendJSON(res, statusCode, {
      error: err.message || 'Internal server error.'
    });
  }
});

function startServer(port = PORT) {
  return new Promise(resolve => {
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { server, startServer };
