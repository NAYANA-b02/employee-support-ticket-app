# Software Requirements Specification (SRS)
## Employee Support Ticket Management Application

**Document Version:** 1.0  
**Document Status:** Draft for Review  
**Target Environment:** Web-based Demonstration Application  

---

## 1. Project Overview

The **Employee Support Ticket Management Application** is a lightweight web application designed to demonstrate the submission, tracking, triage, and resolution of workplace technical support requests. 

The application serves two user roles:
1. **Employees**, who log operational issues and track their progress.
2. **Support Staff**, who manage, prioritize, update, and resolve tickets across the company.

To facilitate demonstration and evaluation, the application operates in a self-contained environment using fictional user profiles and demonstration data, with no external enterprise system dependencies.

---

## 2. Problem Statement

Employees in an organization regularly face technical friction spanning:
* **Hardware issues** (e.g., faulty peripherals, power adapter failures, device malfunctions).
* **Software issues** (e.g., application crashes, installation hurdles, configuration errors).
* **Network connectivity** (e.g., VPN authentication disruptions, Wi-Fi drops).
* **Access permissions** (e.g., shared drive authorizations, folder access).

When requests are managed manually through ad-hoc communication (emails, direct chat messages, verbal requests), several problems arise:
* **Difficulty Tracking Issues:** Without a centralized ledger, requests easily fall through the cracks or go unaddressed.
* **Lack of Visibility:** Employees cannot easily verify the current status or progress of their issues, causing repetitive inquiries.
* **Inefficient Resolution:** Support staff lack a consolidated view to triage, prioritize, and communicate updates systematically.
* **Lack of History:** No central record exists of timestamps, status changes, and communication history for resolved issues.

---

## 3. Project Objectives

1. **Centralized Incident Submission:** Enable users to submit support tickets with required information (Title, Description, Category, Priority).
2. **Role-Partitioned Visibility:** Ensure employees see only their own tickets, while support staff have a comprehensive view of all tickets.
3. **Structured Status Management:** Provide support staff with a clear status management workflow (`Open` → `In Progress` → `Resolved` → `Closed`).
4. **Contextual Communication:** Support bi-directional communication between employees and support staff through ticket-specific comments, including after ticket closure.
5. **Discovery via Search and Filtering:** Allow users to locate tickets quickly using text search and category, priority, and status filters.
6. **Audit and Timestamp Automation:** Automatically record creation dates and update modification dates on every ticket change.

---

## 4. User Roles and Permissions

### 4.1. Role Definitions
* **Employee:** Standard company employees (e.g., Ravi, Priya, Alex) who submit technical issues and monitor their resolution.
* **Support Staff:** Technical helpdesk specialists (e.g., Sam, Sarah) who triage, investigate, update, and resolve tickets.

*(Note: Role-based permissions and the demo persona switcher are designed specifically for demonstrating the application's workflows and role behaviors; they are not production-grade authentication or security mechanisms).*

### 4.2. Permissions Matrix

| System Action | Employee | Support Staff | Rule Type | Governing Rule |
| :--- | :---: | :---: | :---: | :--- |
| **Create Ticket** | ✅ Yes | ✅ Yes | **Implementation Decision** | Status is always automatically initialized to `Open`. |
| **View Own Submitted Tickets** | ✅ Yes | ✅ Yes | **Original Requirement** | An employee sees only their own tickets. |
| **View All Submitted Tickets** | ❌ No | ✅ Yes | **Original Requirement** | Support staff see all tickets across the organization. |
| **Edit Ticket Fields (Title, Desc, Category, Priority)** | ✅ Yes* | ❌ No | **Implementation Decision** | *Only the employee who created the ticket can edit these fields, provided the ticket is **not Closed**. Other employees and Support Staff cannot edit these fields. |
| **Change Ticket Status** | ❌ No | ✅ Yes | **Original Requirement** | Only support staff can change a ticket's status. |
| **Add Comments to Active Tickets (`Open`, `In Progress`, `Resolved`)** | ✅ Yes | ✅ Yes | **Original Requirement** | Both roles can communicate via ticket comments. |
| **Add Comments to `Closed` Tickets** | ✅ Yes | ✅ Yes | **Original Requirement** | A Closed ticket cannot be edited, but comments can still be added. |
| **Search and Filter Tickets** | ✅ Yes | ✅ Yes | **Original Requirement** | Employees search/filter their own tickets; Support staff search/filter all tickets. |

---

## 5. Functional Requirements

Requirements are classified as either:
* **[Original Requirement]:** Explicitly specified in the product prompt.
* **[Implementation Decision]:** Clarification or architectural decision added to support a complete demonstration.

### 5.1. Ticket Creation
* **REQ-F-01 [Original Requirement]:** The application shall provide a ticket creation interface enabling users to submit new support requests.
* **REQ-F-02 [Original Requirement]:** The submission interface shall capture:
  * **Title:** Required text string (up to 100 characters).
  * **Description:** Required text detailing the issue.
  * **Category:** Single selection from a predefined list (`Hardware`, `Software`, `Network`, `Access`, `Other`).
  * **Priority:** Single selection from a predefined list (`Low`, `Medium`, `High`).
* **REQ-F-03 [Original Requirement]:** The application shall automatically set the initial ticket status to `Open`.
* **REQ-F-04 [Original Requirement]:** The application shall automatically record `Created by` (current active user) and `Created date` (current date).
* **REQ-F-05 [Implementation Decision]:** Both Employee and Support Staff roles are permitted to submit new support tickets. Newly created tickets always start in `Open` status regardless of the creator's role.

### 5.2. Ticket Dashboard & Display
* **REQ-F-06 [Original Requirement]:** The application shall provide a dashboard displaying submitted tickets and their details.
* **REQ-F-07 [Original Requirement]:** The dashboard shall partition data based on the active role:
  * Employees shall only see tickets they created.
  * Support staff shall see all submitted tickets across the organization.
* **REQ-F-08 [Original Requirement]:** Ticket listings shall display key attributes: Title, Category, Priority, Status, Created by, Created date, and Last updated date.

### 5.3. Ticket Tracking & Detail View
* **REQ-F-09 [Original Requirement]:** The application shall provide a detail view for individual tickets allowing employees and support staff to track ticket progress.
* **REQ-F-10 [Original Requirement]:** The detail view shall display full ticket information, current status, creation/update timestamps, and the associated comment thread.
* **REQ-F-11 [Implementation Decision]:** The detail view shall present a visual lifecycle progress indicator (`Open` → `In Progress` → `Resolved` → `Closed`) highlighting the current stage.

### 5.4. Ticket Editing
* **REQ-F-12 [Original Requirement]:** Employees can update their requests when permitted.
* **REQ-F-13 [Original Requirement]:** A Closed ticket cannot be edited.
* **REQ-F-14 [Implementation Decision]:** Only the employee who created the ticket is permitted to edit its Title, Description, Category, and Priority, provided the ticket is **not Closed** (`Open`, `In Progress`, or `Resolved`). Other employees cannot edit the ticket, and Support Staff manage status and comments rather than editing original request fields. Edits remain subject to:
  * Title (subject to 100-character limit and non-empty validation)
  * Description (subject to non-empty validation)
  * Category (valid selection from list)
  * Priority (valid selection from list)

### 5.5. Status Management
* **REQ-F-15 [Original Requirement]:** Only support staff can change a ticket's status.
* **REQ-F-16 [Original Requirement]:** Status transitions follow the lifecycle: `Open` → `In Progress` → `Resolved` → `Closed`.
* **REQ-F-17 [Implementation Decision]:** For demonstration flexibility, support staff are permitted to move tickets between any valid statuses (including reopening a `Resolved` ticket back to `In Progress` if required).
* **REQ-F-18 [Original Requirement]:** Employees shall not have access to controls that modify ticket status.

### 5.6. Comments & Communication
* **REQ-F-19 [Original Requirement]:** Employees and support staff can communicate through ticket comments.
* **REQ-F-20 [Original Requirement]:** Comments can still be added to a ticket after it has been marked as `Closed`.
* **REQ-F-21 [Implementation Decision]:** Each comment shall capture and display the author's name, role (`Employee` or `Support Staff`), comment text, and creation timestamp. Comments are append-only.

### 5.7. Search and Filtering
* **REQ-F-22 [Original Requirement]:** The application shall provide search and filtering capabilities to find tickets using relevant details.
* **REQ-F-23 [Implementation Decision]:** The search functionality shall match against Title, Description, Ticket ID, and Creator.
* **REQ-F-24 [Implementation Decision]:** Filtering options shall include:
  * Category: `All`, `Hardware`, `Software`, `Network`, `Access`, `Other`
  * Priority: `All`, `Low`, `Medium`, `High`
  * Status: `All`, `Open`, `In Progress`, `Resolved`, `Closed`

### 5.8. Input Validation
* **REQ-F-25 [Original Requirement]:** The application shall ensure required fields are completed. Title and description cannot be empty.
* **REQ-F-26 [Original Requirement]:** Title length shall not exceed 100 characters.
* **REQ-F-27 [Implementation Decision]:** Inputs consisting exclusively of whitespace shall be rejected with informative error messages.

### 5.9. Timestamp Management
* **REQ-F-28 [Original Requirement]:** The application shall automatically record creation dates (`Created date`).
* **REQ-F-29 [Original Requirement]:** The application shall automatically update the last modified date (`Last updated date`) on every change (including field edits, status transitions, and comment additions).

---

## 6. Non-Functional Requirements

### 6.1. Usability & Demonstration Suitability
* **NFR-01 [Demonstration Clarity]:** The application interface shall be intuitive, responsive, and clearly highlight role-specific behavior during live demonstrations.
* **NFR-02 [Visual Role Context]:** The UI shall display an explicit banner or badge indicating the active persona and role perspective.
* **NFR-03 [Clean Feedback]:** Validation errors and successful operations (creation, update, comment) shall trigger clear visual feedback (e.g., inline alerts or toast messages).

### 6.2. Architecture & Performance
* **NFR-04 [Client Responsiveness]:** Search queries, filtering, and role switching shall execute instantaneously without noticeable latency.
* **NFR-05 [Lightweight Footprint]:** The application shall remain simple, self-contained, and runnable without heavy third-party infrastructure.

### 6.3. Security & Boundary Isolation
* **NFR-06 [Role Boundary Simulation]:** Data queries and state modifications enforce role boundaries for demonstrating workflows (e.g., employee cannot retrieve or modify other users' tickets). As a demonstration prototype, this is not production-grade authentication or security.
* **NFR-07 [No Secret Exposure]:** The application shall not store, require, or expose passwords, API tokens, or secrets.

### 6.4. Reliability & Basic Workflow Testing
* **NFR-08 [Basic Workflow Testing]:** Basic automated tests shall verify the main application workflows: initial sample data loading, role-based ticket visibility, ticket creation with validation, status updates by support staff, closed-ticket editing restrictions, and adding comments.
* **NFR-09 [Deterministic State]:** The application shall include a state reset capability to return sample data to the original predefined state at any point during a demonstration.

---

## 7. Business Rules

| Rule ID | Rule Statement | Origin | System Enforcement |
| :---: | :--- | :---: | :--- |
| **BR-01** | **Only support staff can change a ticket's status.** | **Original Requirement** | Status controls are disabled/hidden for Employees. Non-support status update attempts are rejected. |
| **BR-02** | **An employee sees only their own tickets; support staff see all tickets.** | **Original Requirement** | The ticket query layer filters by `createdBy == activeUser` when the active role is Employee. Support staff view all records. |
| **BR-03** | **A Closed ticket can't be edited, but comments can still be added.** | **Original Requirement** | When status is `Closed`, title, description, category, and priority fields are locked. The comment submission input remains enabled. |
| **BR-04** | **Title and description can't be empty; Title up to 100 characters.** | **Original Requirement** | Form validation enforces $1 \le \text{length(trim(Title))} \le 100$ and $\text{length(trim(Description))} \ge 1$. |
| **BR-05** | **App sets initial status to Open.** | **Original Requirement** | All newly created tickets automatically receive `status = "Open"`. |
| **BR-06** | **App fills Created by and Created date automatically.** | **Original Requirement** | The creator's name and creation timestamp are stamped by the system and cannot be manually overridden. |
| **BR-07** | **App updates Last updated date on every change.** | **Original Requirement** | Any modification (field update, status transition, comment addition) refreshes `Last updated date`. |

---

## 8. Ticket Data Fields

| Field | Type | Required | Filled By | Allowed Values / Constraints | Example (from prompt) |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `id` | String | Yes | App generated *(Implementation Decision)* | Unique identifier (e.g., `TICK-101`) | `1` / `TICK-101` |
| `title` | String | Yes | User (Employee or Support) | Up to 100 characters, non-empty | `Laptop not charging` |
| `description` | String | Yes | User (Employee or Support) | Non-empty text | `My laptop shows 0% even when plugged in` |
| `category` | Enum | Yes | User picks from list | `Hardware`, `Software`, `Network`, `Access`, `Other` | `Hardware` |
| `priority` | Enum | Yes | User picks from list | `Low`, `Medium`, `High` | `High` |
| `status` | Enum | Yes | App sets it; Support Staff change it | `Open`, `In Progress`, `Resolved`, `Closed` | `Open` |
| `createdBy` | String | Yes | App fills automatically | Active fictional user name | `Ravi` |
| `createdDate` | Date/Time | Yes | App fills automatically | Current date / timestamp | `18 Nov 2026` |
| `lastUpdatedDate` | Date/Time | Yes | App updates on every change | Updated date / timestamp | `18 Nov 2026` |
| `comments` | Array | No | Employees & Support Staff *(Implementation Decision)* | List of comment objects | *(Comment thread)* |

---

## 9. User Workflows

### 9.1. Persona Switching Workflow *(Demonstration Only)*
1. Demonstrator clicks the fictional persona selector in the application header.
2. Demonstrator selects a fictional user:
   * **Ravi** (Employee)
   * **Priya** (Employee)
   * **Alex** (Employee)
   * **Sam** (Support Staff)
   * **Sarah** (Support Staff)
3. Application immediately switches active role context and refreshes visible tickets according to BR-02.
4. *(Note: This workflow is for demonstration convenience only and does not represent real authentication).*

### 9.2. Ticket Creation Workflow
1. User (Employee or Support Staff) clicks **"New Ticket"**.
2. User enters Title (with real-time counter up to 100 characters), Description, Category, and Priority.
3. User submits form.
4. System validates inputs (BR-04), assigns `status = "Open"` (BR-05), sets `createdBy = activeUser`, sets `createdDate` and `lastUpdatedDate` (BR-06, BR-07).
5. Ticket appears in the dashboard.

### 9.3. Ticket Tracking & Editing Workflow (Employee)
1. Employee views personal tickets on the dashboard.
2. Employee selects a ticket to open its detail view.
3. Employee tracks status progress.
4. **If ticket is not Closed:** Only the employee who created the ticket can edit its Title, Description, Category, or Priority and save changes. System updates `lastUpdatedDate`. Other employees cannot edit it.
5. **If ticket is Closed:** Edit controls are disabled, displaying an alert: *"A Closed ticket cannot be edited. Comments can still be added."*
6. Employee can post a comment regardless of status.

### 9.4. Ticket Management Workflow (Support Staff)
1. Support Staff views company-wide tickets.
2. Support Staff searches or filters tickets by Category, Priority, or Status.
3. Support Staff opens a ticket.
4. Support Staff selects a new status (`Open`, `In Progress`, `Resolved`, `Closed`).
5. System applies status change and updates `lastUpdatedDate`.
6. Support Staff adds troubleshooting or resolution comments.

---

## 10. Input Validation Rules

| Field / Action | Validation Rule | Error / Warning Message |
| :--- | :--- | :--- |
| **Title (Empty)** | Reject if empty or only whitespace | *"Title is required and cannot be empty."* |
| **Title (Length)** | Reject if $> 100$ characters | *"Title cannot exceed 100 characters."* |
| **Description (Empty)** | Reject if empty or only whitespace | *"Description is required and cannot be empty."* |
| **Category Selection** | Value must be in allowed list | *"Please select a valid category."* |
| **Priority Selection** | Value must be in allowed list | *"Please select a valid priority."* |
| **Status Change by Employee** | Prevent status change if active role is Employee | *"Only support staff can change a ticket's status."* |
| **Field Edit on Closed Ticket** | Prevent field edits if `status === 'Closed'` | *"A Closed ticket cannot be edited. Comments can still be added."* |
| **Comment (Empty)** | Reject if comment text is empty or only whitespace | *"Comment text cannot be empty."* |

---

## 11. Sample Data

### 11.1. Canonical Sample Tickets (From Original Product Prompt)

The 5 sample tickets explicitly specified in the product prompt are listed below. 

> **Clarification:** The original product prompt provided `#`, `Title`, `Category`, `Priority`, and `Status` for these 5 tickets, and gave `Ravi`, `18 Nov 2026`, and `My laptop shows 0% even when plugged in` as an illustrative detail example. In the table below, `Created By`, `Created Date`, `Last Updated Date`, and `Description` are populated to provide complete, realistic records for demonstration purposes.

| # | Title | Category | Priority | Status | Created By *(Demo)* | Created Date *(Demo)* | Last Updated Date *(Demo)* | Description *(Demo Illustrative)* |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | Laptop not charging | Hardware | High | Open | Ravi | 18 Nov 2026 | 18 Nov 2026 | My laptop shows 0% even when plugged in. Tried different power outlets but charging LED remains off. |
| **2** | Cannot log in to VPN | Network | High | In Progress | Priya | 18 Nov 2026 | 18 Nov 2026 | Receiving certificate authentication error when connecting to GlobalProtect VPN. |
| **3** | Need access to the shared project folder | Access | Medium | Open | Ravi | 18 Nov 2026 | 18 Nov 2026 | Requesting read and write permissions to the shared Apollo project folder. |
| **4** | Excel keeps crashing on startup | Software | Medium | Resolved | Alex | 18 Nov 2026 | 18 Nov 2026 | Microsoft Excel 365 crashes immediately with error code 0xc0000005 when opening spreadsheets. |
| **5** | Request a second monitor | Hardware | Low | Closed | Priya | 18 Nov 2026 | 18 Nov 2026 | Requesting an additional 27-inch external monitor for UI design layouts. |

### 11.2. Fictional Personas *(Implementation Decision for Demo)*

| Name | Role | Department / Job Title |
| :--- | :--- | :--- |
| **Ravi** | Employee | Software Engineer |
| **Priya** | Employee | Product Designer |
| **Alex** | Employee | Marketing Lead |
| **Sam** | Support Staff | IT Support Specialist |
| **Sarah** | Support Staff | Senior Helpdesk Lead |

---

## 12. Assumptions and Limitations

### 12.1. Confirmed Limitations (From Product Prompt)
* **Fictional Data Only:** Use fictional sample employee data.
* **No External Integrations:** Do not integrate external company systems (e.g., Active Directory, LDAP, email servers, Slack, Jira).
* **No Real Credentials:** Do not use real employee credentials or personal information.
* **Demonstration Scope:** Keep the application simple and suitable for a demonstration.
* **No Secret Exposure:** Do not expose passwords, API keys, or other secrets.

### 12.2. Explicit Exclusions (Out of Scope)
* **No Ticket Assignment Feature:** Tickets are managed collaboratively from a shared queue; no individual assignment mechanism (`assignedTo`) is included.
* **No Ticket Deletion Feature:** Tickets cannot be deleted by either role. Completed or invalid tickets are managed via status transitions to `Closed`.

---

## 13. Implementation Decisions and Missing Requirements

The following decisions address ambiguities in the original prompt while preserving all confirmed requirements:

| # | Topic | Original Prompt Status | Implementation Decision | Rationale |
| :---: | :--- | :--- | :--- | :--- |
| **DEC-01** | **Persona Switcher** | Unspecified how demo user identity is switched. | **Include an interactive Persona Switcher header** for Ravi, Priya, Alex, Sam, and Sarah. Explicitly clarify that role-based permissions are for demonstrating application workflows and are not production-grade authentication or security. | Enables testing role-based visibility and actions without requiring authentication infrastructure. |
| **DEC-02** | **Ticket Creation by Support Staff** | Prompt mentions "Employees can create support tickets." | **Allow both Employees and Support Staff to create tickets.** Newly created tickets always start in `Open` status automatically. | Practical for support staff logging issues on behalf of users or internal IT incidents. |
| **DEC-03** | **Employee Edit Boundary** | Prompt notes employees can update "when permitted" and "Closed ticket can't be edited." | **Only the employee who created the ticket can edit its Title, Description, Category, and Priority, provided the ticket is not Closed.** Once `Closed`, fields are locked. Other employees and Support Staff cannot edit these fields. | Directly satisfies BR-03, enforces request ownership, and allows employees to clarify active requests. |
| **DEC-04** | **Status Transition Flexibility** | Prompt illustrates `Open → In Progress → Resolved → Closed`. | **Support staff can move tickets between valid statuses.** Documented as a demonstration design decision. | Enables full evaluation during demos (e.g., moving Resolved back to In Progress if an issue recurs). |
| **DEC-05** | **Post-Closure Comments** | Prompt states "A Closed ticket can't be edited, but comments can still be added." | **Comment form remains fully active on Closed tickets.** | Directly fulfills BR-03 and enables follow-up discussions after resolution. |
| **DEC-06** | **Local Data Persistence** | Persistence mechanism not specified. | **Implement local JSON file storage using `data/tickets.json`.** | Provides straightforward, persistent file-based storage suitable for a student/learning demo without requiring external database software. |
| **DEC-07** | **Reset Demo Data Option** | Not specified in prompt. | **Provide a "Reset Demo Data" action** that restores the 5 original sample tickets. | Allows demonstrators to reset the application state after testing modifications. |
| **DEC-08** | **Exclusion of Assignment & Deletion** | Not specified in prompt. | **Do not implement ticket assignment or ticket deletion features.** | Preserves simplicity, avoids requirement creep, and maintains an immutable audit trail. |

---

*End of Specification — SPEC.md*

