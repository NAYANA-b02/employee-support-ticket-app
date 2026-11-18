# Employee Support Ticket Management Application
*(Student / Learning Demo Prototype)*

A lightweight, self-contained web application for managing employee technical support requests. Built using standard Node.js built-in modules, vanilla JavaScript, HTML5, and responsive CSS with **zero external dependencies**.

* **GitHub Repository:** [https://github.com/NAYANA-b02/employee-support-ticket-app](https://github.com/NAYANA-b02/employee-support-ticket-app)
* **Specification:** [SPEC.md](SPEC.md)

---

## Project Overview

The **Employee Support Ticket Management Application** is designed as a learning and demonstration prototype that models an internal IT helpdesk system. It enables employees to report technical issues (across Hardware, Software, Network, Access, and Other categories) and track their progress, while providing support staff with a consolidated dashboard to triage, update statuses, and communicate through ticket comments.

### Technologies Used
* **Backend:** Node.js (v20+) using standard built-in modules (`http`, `fs`, `path`, `url`). No external npm packages or build tools are required.
* **Frontend:** Vanilla JavaScript (ES6+), HTML5, and responsive CSS3 with CSS custom properties.
* **Data Storage:** Local file-based storage using formatted JSON files (`data/tickets.json` and `data/sampleTickets.json`).
* **Automated Testing:** Node.js native test runner (`node:test`, `node:assert`).

---

## Core Features

1. **Demo Persona Switcher**: An interactive dropdown in the navigation bar to switch between fictional users (Ravi, Priya, Alex, Sam, Sarah) to immediately demonstrate role-based permissions and views.
2. **Role-Based Ticket Visibility**:
   * **Employees** see only their own submitted tickets.
   * **Support Staff** see all tickets across the organization.
3. **Ticket Creation with Input Validation**:
   * Title required (up to 100 characters with live character counter).
   * Description required (non-empty text).
   * Category and Priority selection.
   * Automatically assigns `status = "Open"`, records creator, and timestamps creation and update dates.
4. **Ticket Editing**:
   * Only the employee who created a ticket can edit its Title, Description, Category, and Priority, provided the ticket is **not Closed**.
   * Closed tickets are locked and cannot have their details edited.
5. **Status Management (Support Staff Only)**:
   * Support staff can update ticket status: `Open` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`.
   * A visual lifecycle progress stepper highlights the active stage.
   * Employees cannot modify ticket status.
6. **Comments & Discussion**:
   * Both Employees and Support Staff can post comments with author role badges and timestamps.
   * Shortcut: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (or <kbd>Cmd</kbd> + <kbd>Enter</kbd>) to quickly submit comments.
   * **Comments remain permitted even on Closed tickets.**
7. **Search & Multi-Filtering**:
   * Real-time search by Title, Description, Ticket ID, or Creator.
   * Multi-criteria filtering by Category, Priority, and Status.
   * "Clear Filters" button to quickly restore default views.
8. **Simple Local Persistence & Demo Reset**:
   * All tickets are persisted directly to `data/tickets.json`.
   * "Reset Demo" button in the header restores the original 5 sample tickets at any time.

---

## Quick Start

### 1. Start the Application
Open a terminal in the project directory and run:

```bash
npm start
```

Then open your browser and navigate to:
```
http://localhost:3000
```

### 2. Run the Automated Tests
To run the automated test suite, execute:

```bash
npm test
```

---

## 1. What AI Generated

During the development of this project, Google Antigravity helped generate:

* **Product Requirements Analysis and Software Specification**: Synthesized the initial problem statement, business rules, and sample tickets into a structured Software Requirements Specification ([SPEC.md](SPEC.md)).
* **Implementation Plan**: Drafted a phased implementation roadmap breaking down backend, frontend, data persistence, and testing steps.
* **Project Folder Structure**: Scaffolded the clean, modular layout containing `public/`, `data/`, and `test/` directories.
* **Node.js Backend and REST API**: Generated `server.js` using Node.js standard libraries to serve static files and handle API endpoints (`/api/users`, `/api/tickets`, `/api/tickets/:id`, `/api/tickets/:id/status`, `/api/tickets/:id/comments`, `/api/reset`).
* **HTML, CSS, and JavaScript Frontend**: Created `public/index.html`, `public/styles.css`, and `public/app.js` featuring an enterprise-style dashboard, status progress steppers, responsive layout, and interactive modals.
* **JSON Sample Data and Storage Functions**: Built `data/sampleTickets.json`, `data/tickets.json`, and `ticketsStore.js` with simple helper functions (`loadTickets()`, `saveTickets()`, `resetTickets()`).
* **Automated Test Cases**: Created `test/tickets.test.js` using Node's built-in `node:test` module covering the core business rules.
* **Initial README Documentation**: Generated user guides and testing scenarios.

---

## 2. What I Changed

During the project lifecycle, the design and scope were refined through guided decisions and reviews to keep the project focused, practical, and suitable for a student prototype:

* **Simplified Implementation Plan for a Student Demo**: Removed complex enterprise patterns (such as defensive multi-stage file locking, complex cryptographic tokens, and heavy middleware) in favor of a clean, beginner-friendly architecture.
* **Used JSON File Storage Instead of a Database**: Opted for straightforward file-based JSON persistence (`data/tickets.json`) using standard Node.js file system methods (`fs.readFileSync`, `fs.writeFileSync`), avoiding the complexity and setup overhead of external database software.
* **Used a Demo Persona Switcher Instead of Real Authentication**: Replaced full credential-based authentication with an in-header persona switcher to easily demonstrate role-based permissions without third-party identity providers or passwords.
* **Reviewed and Updated SPEC.md**: Adjusted the specification to align with the simplified demo decisions:
  * Updated `DEC-06` to specify local JSON file storage using `data/tickets.json`.
  * Clarified that role-based permissions and the persona switcher are strictly for demonstrating workflows and are not production-grade authentication.
  * Explicitly specified that only the employee who created a ticket can edit its Title, Description, Category, and Priority (while not Closed).
  * Focused basic testing requirements on verifying main application workflows.
* **Refined Implementation Through Multiple Structured Stages**: Reused the initial Phase 1 and Phase 2 foundations and iteratively developed and verified the backend API, frontend interface, and test coverage in small increments.

---

## 3. What I Checked

The following validations and tests were executed and confirmed during implementation:

* **Validity of `sampleTickets.json` and `tickets.json`**: Confirmed both files contain valid JSON and match the 5 canonical sample tickets.
* **Required Ticket Fields and Sample Data**: Verified that all 10 required attributes (`id`, `title`, `description`, `category`, `priority`, `status`, `createdBy`, `createdDate`, `lastUpdatedDate`, `comments`) are present in all sample tickets and that comments arrays are initially empty.
* **Backend API Functionality**: Tested API endpoints for retrieving users, retrieving role-scoped tickets, creating tickets, updating ticket fields, changing statuses, appending comments, and resetting data.
* **Employee vs. Support Staff Role-Based Ticket Visibility**: Verified that selecting an Employee persona (Ravi, Priya, Alex) filters the view strictly to their own tickets, whereas selecting Support Staff (Sam, Sarah) returns all tickets across the organization.
* **Ticket Creation, Editing, and Status Updates**: Verified that new tickets receive the `Open` status automatically, title character counts are bounded to 100 characters, only creator employees can edit their open tickets, and only Support Staff can update ticket statuses.
* **Comments on Active and Closed Tickets**: Verified that comments capture author, role, and timestamps, and that comments can still be submitted on tickets in `Closed` status.
* **Search and Filtering**: Verified real-time search matching across ticket titles, descriptions, IDs, and creators, as well as category, priority, and status filtering.
* **Reset Demo Functionality**: Verified that triggering the reset action completely restores the 5 original sample tickets and refreshes the live view.
* **Automated Tests via `npm test`**: Ran the test suite using Node.js's native test runner (`node --test test/tickets.test.js`). **All 9 automated tests passed cleanly with 0 failures.**
* **Application Execution via `npm start` & Manual Testing**: Started the server on port 3000 and manually tested all UI modal flows, responsive layout adjustments, and keyboard shortcuts (<kbd>Ctrl</kbd> + <kbd>Enter</kbd> and <kbd>Escape</kbd>) in the browser.
* **Basic Input Validation & File Organization**: Confirmed that empty titles and whitespace-only descriptions are rejected with error messages and that project files remain cleanly structured in `public/`, `data/`, and `test/`.

---

## 4. Known Gaps and Limitations

To keep the application accessible as a student learning prototype, the following limitations are explicitly noted:

* **Fictional Demo Personas (No Real Authentication)**: The application does not feature secure authentication, passwords, sessions, or JSON Web Tokens (JWT). Active personas are selected via a dropdown for demonstration convenience.
* **Client-Side Role Switching (Not Production Security)**: Persona state can be changed in the browser; role-based visibility is intended solely for demonstrating business logic and workflows, not for securing real company data.
* **Local JSON File Storage**: Ticket data is stored in a flat JSON file on the local file system. It is not designed for concurrent multi-user writes, transactions, or high-volume enterprise traffic.
* **No Database or External Integrations**: The application does not connect to SQL/NoSQL databases, email notification servers (SMTP), LDAP/Active Directory, or third-party ticketing tools (e.g., Jira, ServiceNow, Slack).
* **Student Learning Prototype**: The project is intentionally scoped as an educational demonstration of support ticket lifecycle management, not as a hardened, production-ready system.

---

## Step-by-Step Demonstration Guide

### Scenario A: Employee Workflow (Ravi)
1. Select **👨‍💻 Ravi (Employee)** in the header dropdown.
2. Note that the dashboard displays only Ravi's 2 tickets (`TICK-101` and `TICK-103`).
3. Click **"➕ New Support Ticket"**:
   * Type a Title (e.g., *Monitor flickering*), observe the `0/100` character counter.
   * Select Category: `Hardware`, Priority: `High`, type a Description, and submit.
   * Observe the ticket is assigned `Open` status and appears in Ravi's dashboard.
4. Click on `TICK-101` (*Laptop not charging*):
   * Click **"✏️ Edit Request"**, modify the description, and save.
   * Scroll down, type a comment in the discussion box, and press <kbd>Ctrl</kbd> + <kbd>Enter</kbd>.
   * Notice status controls are disabled with the message: *"Only support staff can change a ticket's status."*

### Scenario B: Support Staff Workflow (Sam)
1. Switch the header dropdown to **🛠️ Sam (Support Staff)**.
2. Notice the table updates to display **all tickets** across the company.
3. Open `TICK-101`:
   * In **Status Management**, click **"In Progress"** (badge and stepper update to step 2).
   * Click **"Resolved"**, then **"Closed"** (stepper reaches step 4).
   * Notice the lock banner appears indicating request details cannot be edited.
4. Type a resolution note in the comment box and click **"💬 Send Comment"**.
   * Confirms that comments can still be added to Closed tickets.

### Scenario C: Resetting Demo Data
1. Click **"🔄 Reset Demo"** in the top-right corner of the navbar.
2. Confirm the reset dialog.
3. The application restores the original 5 canonical sample tickets from SPEC.md.
