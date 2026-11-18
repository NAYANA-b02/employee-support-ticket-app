# Employee Support Ticket Management Application
*(Student / Learning Demo Prototype)*

A clean, lightweight web application for managing employee technical support requests. Built with Node.js built-in modules, vanilla JavaScript, HTML5, and responsive CSS with **zero external dependencies**.

---

## Features

1. **Demo Persona Switcher**: Switch instantly between fictional personas (Ravi, Priya, Alex, Sam, Sarah) in the header to demonstrate role-based permissions and views.
2. **Role-Based Ticket Visibility**:
   - **Employees** see only their own submitted tickets.
   - **Support Staff** see all tickets across the organization.
3. **Ticket Creation with Validation**:
   - Title required (up to 100 characters with live character counter).
   - Description required.
   - Category and Priority selection.
   - Automatically sets `status = "Open"`, records creator, and timestamps creation and update dates.
4. **Ticket Editing**:
   - Only the employee who created a ticket can edit its Title, Description, Category, and Priority, provided it is **not Closed**.
   - Closed tickets are locked and cannot be edited.
5. **Status Management (Support Staff Only)**:
   - Support staff can update ticket status: `Open` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`.
   - Visual status progress stepper highlights the active lifecycle stage.
   - Employees cannot modify ticket status.
6. **Comments & Discussion**:
   - Both Employees and Support Staff can post comments with timestamps and role badges.
   - Shortcut: `Ctrl + Enter` (or `Cmd + Enter`) to quickly send comments.
   - **Comments are permitted even on Closed tickets.**
7. **Search & Multi-Filter**:
   - Real-time search by Title, Description, Ticket ID, or Creator.
   - Filter by Category, Priority, and Status.
   - "Clear Filters" button to reset view.
8. **Simple Local Persistence & Demo Reset**:
   - All tickets are stored in `data/tickets.json`.
   - "Reset Demo" button in the header restores the original 5 sample tickets at any time.

---

## Quick Start

### 1. Run the Application
Open a terminal in the project directory and run:

```bash
npm start
```

Then open your browser to:
```
http://localhost:3000
```

### 2. Run the Automated Tests
Run the built-in test suite:

```bash
npm test
```

---

## How to Test the Main Workflows

### Scenario A: Employee Workflow (Ravi)
1. In the header dropdown, select **👨‍💻 Ravi (Employee)**.
2. Notice the dashboard displays only Ravi's 2 tickets (`TICK-101` and `TICK-103`).
3. Click **"New Support Ticket"**:
   - Type a title (observe character counter: e.g., `25/100`).
   - Select Category and Priority, type a description, and submit.
   - Verify the new ticket appears in `Open` status.
4. Click on `TICK-101` to view its details:
   - Notice the visual status stepper at step 1 (`Open`).
   - Click **"✏️ Edit Request"**, update the description, and click Save.
   - Scroll to the comments section, type a comment, and press `Ctrl+Enter`.
   - Notice status controls are disabled with the message: *"Only support staff can change a ticket's status."*

### Scenario B: Support Staff Workflow (Sam)
1. In the header dropdown, switch to **🛠️ Sam (Support Staff)**.
2. Notice the dashboard now displays **all company tickets** (including Priya's and Alex's).
3. Click on `TICK-101`:
   - Click the **"In Progress"** status button. Observe the status badge and stepper update to `In Progress`.
   - Click the **"Resolved"** button, then **"Closed"**.
   - Notice the closed ticket lock banner appears: *"This ticket is Closed. The request details are locked..."*
4. In the comment box, type a resolution note and click **"Send Comment"**.
   - Verify that comments can still be added to Closed tickets!

### Scenario C: Resetting Demo Data
1. Click the **"🔄 Reset Demo"** button in the top right of the navbar.
2. Confirm the reset dialog.
3. The application will instantly reload the original 5 canonical sample tickets.

