// app.js - Employee Support Ticket Management Application
// Single-page application logic for the student/learning demo prototype.

document.addEventListener('DOMContentLoaded', () => {

  // ==============================================================
  // Application State
  // ==============================================================
  const state = {
    users: [],
    currentPersona: null,
    tickets: [],
    activeTicket: null,
    filters: {
      search: '',
      category: 'All',
      priority: 'All',
      status: 'All',
      sort: 'newest'
    }
  };

  // ==============================================================
  // DOM Elements
  // ==============================================================
  const personaSelect = document.getElementById('personaSelect');
  const activePersonaAvatar = document.getElementById('activePersonaAvatar');
  const activePersonaRoleBadge = document.getElementById('activePersonaRoleBadge');
  const roleContextBanner = document.getElementById('roleContextBanner');
  const bannerText = document.getElementById('bannerText');

  // KPI Elements
  const kpiTotal = document.getElementById('kpiTotal');
  const kpiOpen = document.getElementById('kpiOpen');
  const kpiProgress = document.getElementById('kpiProgress');
  const kpiResolved = document.getElementById('kpiResolved');
  const kpiClosed = document.getElementById('kpiClosed');

  // Filter Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryFilter = document.getElementById('categoryFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  const statusFilter = document.getElementById('statusFilter');
  const sortFilter = document.getElementById('sortFilter');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const ticketCountLabel = document.getElementById('ticketCountLabel');

  // Table & Empty State
  const ticketsTableBody = document.getElementById('ticketsTableBody');
  const emptyState = document.getElementById('emptyState');
  const emptyActionBtn = document.getElementById('emptyActionBtn');

  // Create Ticket Modal
  const newTicketModal = document.getElementById('newTicketModal');
  const openNewTicketBtn = document.getElementById('openNewTicketBtn');
  const closeNewTicketBtn = document.getElementById('closeNewTicketBtn');
  const cancelNewTicketBtn = document.getElementById('cancelNewTicketBtn');
  const newTicketForm = document.getElementById('newTicketForm');
  const newTicketCreatorLabel = document.getElementById('newTicketCreatorLabel');
  const ticketTitleInput = document.getElementById('ticketTitleInput');
  const titleCharCount = document.getElementById('titleCharCount');
  const ticketCategorySelect = document.getElementById('ticketCategorySelect');
  const ticketPrioritySelect = document.getElementById('ticketPrioritySelect');
  const ticketDescInput = document.getElementById('ticketDescInput');
  const titleError = document.getElementById('titleError');
  const descError = document.getElementById('descError');

  // Ticket Detail Modal
  const detailModal = document.getElementById('detailModal');
  const closeDetailBtn = document.getElementById('closeDetailBtn');
  const detailTicketIdBadge = document.getElementById('detailTicketIdBadge');
  const detailTitleText = document.getElementById('detailTitleText');
  const detailCategoryBadge = document.getElementById('detailCategoryBadge');
  const detailPriorityBadge = document.getElementById('detailPriorityBadge');
  const detailStatusBadge = document.getElementById('detailStatusBadge');
  const detailCreatedBy = document.getElementById('detailCreatedBy');
  const detailCreatedDate = document.getElementById('detailCreatedDate');
  const detailLastUpdatedDate = document.getElementById('detailLastUpdatedDate');
  const detailDescText = document.getElementById('detailDescText');
  const closedAlertBanner = document.getElementById('closedAlertBanner');

  // Stepper Elements
  const stepOpen = document.getElementById('stepOpen');
  const stepProgress = document.getElementById('stepProgress');
  const stepResolved = document.getElementById('stepResolved');
  const stepClosed = document.getElementById('stepClosed');
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  const line3 = document.getElementById('line3');

  // Edit Mode Elements
  const startEditBtn = document.getElementById('startEditBtn');
  const viewModeContainer = document.getElementById('viewModeContainer');
  const editModeContainer = document.getElementById('editModeContainer');
  const editTitleInput = document.getElementById('editTitleInput');
  const editTitleCharCount = document.getElementById('editTitleCharCount');
  const editCategorySelect = document.getElementById('editCategorySelect');
  const editPrioritySelect = document.getElementById('editPrioritySelect');
  const editDescInput = document.getElementById('editDescInput');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  // Status Controls
  const supportStatusControls = document.getElementById('supportStatusControls');
  const employeeStatusNotice = document.getElementById('employeeStatusNotice');

  // Comments Elements
  const commentsList = document.getElementById('commentsList');
  const commentCountBadge = document.getElementById('commentCountBadge');
  const addCommentForm = document.getElementById('addCommentForm');
  const commentAuthorLabel = document.getElementById('commentAuthorLabel');
  const commentTextInput = document.getElementById('commentTextInput');

  // Reset Demo Modal
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  const resetModal = document.getElementById('resetModal');
  const closeResetModalBtn = document.getElementById('closeResetModalBtn');
  const cancelResetBtn = document.getElementById('cancelResetBtn');
  const confirmResetBtn = document.getElementById('confirmResetBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // ==============================================================
  // API Fetch Helper
  // ==============================================================
  async function apiFetch(urlPath, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(state.currentPersona ? { 'X-Persona-Id': state.currentPersona.id } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(urlPath, { ...options, headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server request failed.');
      }
      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  }

  // ==============================================================
  // Toast Notifications
  // ==============================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  // ==============================================================
  // Initialization
  // ==============================================================
  async function init() {
    try {
      // 1. Load users from backend
      const data = await apiFetch('/api/users');
      state.users = data.users;

      // 2. Populate persona switcher dropdown
      personaSelect.innerHTML = '';
      state.users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = `${u.avatar} ${u.name} (${u.role} - ${u.title})`;
        personaSelect.appendChild(opt);
      });

      // 3. Restore last chosen persona or default to Ravi (u1)
      const savedPersonaId = localStorage.getItem('activePersonaId') || 'u1';
      const matched = state.users.find(u => u.id === savedPersonaId) || state.users[0];
      setPersona(matched);

      // 4. Load initial tickets
      await loadAndRenderTickets();
    } catch (err) {
      showToast('Failed to initialize app: ' + err.message, 'error');
    }
  }

  // ==============================================================
  // Persona Switching Logic
  // ==============================================================
  function setPersona(user) {
    state.currentPersona = user;
    localStorage.setItem('activePersonaId', user.id);
    personaSelect.value = user.id;
    activePersonaAvatar.textContent = user.avatar;

    // Update role badge in header
    activePersonaRoleBadge.textContent = user.role;
    if (user.role === 'Support Staff') {
      activePersonaRoleBadge.className = 'role-badge role-support';
      roleContextBanner.className = 'role-context-banner role-support-banner';
      bannerText.innerHTML = `🛠️ <strong>Support Staff View:</strong> Showing all tickets across the organization. You can update statuses, resolve issues, and add comments.`;
    } else {
      activePersonaRoleBadge.className = 'role-badge role-employee';
      roleContextBanner.className = 'role-context-banner role-employee-banner';
      bannerText.innerHTML = `👤 <strong>Employee View:</strong> Showing only tickets submitted by you (<strong>${user.name}</strong>). You can create tickets, edit your open requests, and add comments.`;
    }

    newTicketCreatorLabel.textContent = `${user.name} (${user.role})`;
    commentAuthorLabel.textContent = `${user.name} (${user.role})`;
  }

  personaSelect.addEventListener('change', async (e) => {
    const selected = state.users.find(u => u.id === e.target.value);
    if (selected) {
      setPersona(selected);
      showToast(`Switched perspective to ${selected.name} (${selected.role})`, 'info');
      await loadAndRenderTickets();
      // If detail modal is open, refresh detail permissions
      if (state.activeTicket) {
        openDetailModal(state.activeTicket);
      }
    }
  });

  // ==============================================================
  // Load and Render Tickets
  // ==============================================================
  async function loadAndRenderTickets() {
    try {
      const queryParams = new URLSearchParams({
        search: state.filters.search,
        category: state.filters.category,
        priority: state.filters.priority,
        status: state.filters.status,
        sort: state.filters.sort
      });

      const data = await apiFetch(`/api/tickets?${queryParams.toString()}`);
      state.tickets = data.tickets;
      renderDashboard();
    } catch (err) {
      showToast('Error loading tickets: ' + err.message, 'error');
    }
  }

  function renderDashboard() {
    // 1. Calculate & update KPI counters
    const total = state.tickets.length;
    const openCount = state.tickets.filter(t => t.status === 'Open').length;
    const progressCount = state.tickets.filter(t => t.status === 'In Progress').length;
    const resolvedCount = state.tickets.filter(t => t.status === 'Resolved').length;
    const closedCount = state.tickets.filter(t => t.status === 'Closed').length;

    kpiTotal.textContent = total;
    kpiOpen.textContent = openCount;
    kpiProgress.textContent = progressCount;
    kpiResolved.textContent = resolvedCount;
    kpiClosed.textContent = closedCount;

    ticketCountLabel.textContent = `Showing ${total} ticket${total === 1 ? '' : 's'}`;

    // 2. Render table rows
    ticketsTableBody.innerHTML = '';

    if (total === 0) {
      emptyState.style.display = 'block';
      if (state.currentPersona.role === 'Employee') {
        emptyActionBtn.style.display = 'inline-flex';
      } else {
        emptyActionBtn.style.display = 'none';
      }
      return;
    }

    emptyState.style.display = 'none';

    state.tickets.forEach(ticket => {
      const row = document.createElement('tr');
      row.className = 'ticket-row';
      row.onclick = () => openDetailModal(ticket);

      // Category class & Priority class
      const priorityClass = ticket.priority.toLowerCase() === 'high' ? 'priority-high' :
                            ticket.priority.toLowerCase() === 'medium' ? 'priority-medium' : 'priority-low';

      // Status class
      const statusSlug = ticket.status.toLowerCase().replace(/\s+/g, '-');
      const statusClass = `status-${statusSlug}`;

      const commentCount = ticket.comments ? ticket.comments.length : 0;
      const commentSnippet = commentCount > 0 ? `<span class="comment-indicator" title="${commentCount} comment(s)">💬 ${commentCount}</span>` : '';

      row.innerHTML = `
        <td><span class="ticket-id">${ticket.id}</span></td>
        <td>
          <span class="ticket-title-link">${escapeHTML(ticket.title)} ${commentSnippet}</span>
          <span class="ticket-desc-snippet">${escapeHTML(ticket.description)}</span>
        </td>
        <td><span class="category-badge">${ticket.category}</span></td>
        <td><span class="priority-badge ${priorityClass}">${ticket.priority}</span></td>
        <td><span class="status-badge ${statusClass}">${ticket.status}</span></td>
        <td>
          <div class="creator-cell">
            <span>${getUserAvatar(ticket.createdBy)}</span>
            <span>${ticket.createdBy}</span>
          </div>
        </td>
        <td>
          <div class="dates-cell">
            <span class="date-created">${ticket.createdDate}</span>
            <span class="date-updated">Updated: ${ticket.lastUpdatedDate}</span>
          </div>
        </td>
        <td style="text-align: center;">
          <button class="btn btn-ghost btn-sm" title="View details">View ➔</button>
        </td>
      `;

      ticketsTableBody.appendChild(row);
    });
  }

  function getUserAvatar(name) {
    const user = state.users.find(u => u.name.toLowerCase() === (name || '').toLowerCase());
    return user ? user.avatar : '👤';
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  // ==============================================================
  // Filter Event Listeners
  // ==============================================================
  let searchTimeout = null;
  searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadAndRenderTickets, 200);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.filters.search = '';
    clearSearchBtn.style.display = 'none';
    loadAndRenderTickets();
  });

  categoryFilter.addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    loadAndRenderTickets();
  });

  priorityFilter.addEventListener('change', (e) => {
    state.filters.priority = e.target.value;
    loadAndRenderTickets();
  });

  statusFilter.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    loadAndRenderTickets();
  });

  sortFilter.addEventListener('change', (e) => {
    state.filters.sort = e.target.value;
    loadAndRenderTickets();
  });

  resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = 'All';
    priorityFilter.value = 'All';
    statusFilter.value = 'All';
    sortFilter.value = 'newest';
    clearSearchBtn.style.display = 'none';

    state.filters = { search: '', category: 'All', priority: 'All', status: 'All', sort: 'newest' };
    loadAndRenderTickets();
    showToast('Filters cleared', 'info');
  });

  // ==============================================================
  // New Ticket Modal Flow
  // ==============================================================
  function openNewModal() {
    newTicketForm.reset();
    titleCharCount.textContent = '0/100';
    titleCharCount.classList.remove('limit-reached');
    titleError.style.display = 'none';
    descError.style.display = 'none';
    newTicketCreatorLabel.textContent = `${state.currentPersona.name} (${state.currentPersona.role})`;
    newTicketModal.style.display = 'flex';
    ticketTitleInput.focus();
  }

  function closeNewModal() {
    newTicketModal.style.display = 'none';
  }

  openNewTicketBtn.addEventListener('click', openNewModal);
  emptyActionBtn.addEventListener('click', openNewModal);
  closeNewTicketBtn.addEventListener('click', closeNewModal);
  cancelNewTicketBtn.addEventListener('click', closeNewModal);

  // Character counter for title
  ticketTitleInput.addEventListener('input', (e) => {
    const len = e.target.value.length;
    titleCharCount.textContent = `${len}/100`;
    if (len >= 100) {
      titleCharCount.classList.add('limit-reached');
    } else {
      titleCharCount.classList.remove('limit-reached');
    }
  });

  newTicketForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    titleError.style.display = 'none';
    descError.style.display = 'none';

    const title = ticketTitleInput.value.trim();
    const description = ticketDescInput.value.trim();
    const category = ticketCategorySelect.value;
    const priority = ticketPrioritySelect.value;

    let hasError = false;
    if (!title) {
      titleError.textContent = 'Title is required and cannot be empty.';
      titleError.style.display = 'block';
      hasError = true;
    }
    if (!description) {
      descError.textContent = 'Description is required and cannot be empty.';
      descError.style.display = 'block';
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await apiFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({ title, description, category, priority })
      });

      showToast(`Ticket ${res.ticket.id} created successfully!`, 'success');
      closeNewModal();
      await loadAndRenderTickets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ==============================================================
  // Ticket Detail & Edit Flow
  // ==============================================================
  function openDetailModal(ticket) {
    state.activeTicket = ticket;

    // Populate header & badges
    detailTicketIdBadge.textContent = ticket.id;
    detailTitleText.textContent = ticket.title;

    detailCategoryBadge.textContent = ticket.category;
    detailPriorityBadge.textContent = `${ticket.priority} Priority`;
    detailPriorityBadge.className = `priority-badge priority-${ticket.priority.toLowerCase()}`;

    const statusSlug = ticket.status.toLowerCase().replace(/\s+/g, '-');
    detailStatusBadge.textContent = ticket.status;
    detailStatusBadge.className = `status-badge status-${statusSlug}`;

    detailCreatedBy.innerHTML = `${getUserAvatar(ticket.createdBy)} ${ticket.createdBy}`;
    detailCreatedDate.textContent = ticket.createdDate;
    detailLastUpdatedDate.textContent = ticket.lastUpdatedDate;
    detailDescText.textContent = ticket.description;

    // Update Stepper
    updateStepper(ticket.status);

    // Closed Immutability check
    const isClosed = ticket.status === 'Closed';
    closedAlertBanner.style.display = isClosed ? 'flex' : 'none';

    // Edit permission check:
    // Only the employee who created the ticket can edit it, and only if NOT closed.
    const isCreatorEmployee = state.currentPersona.role === 'Employee' &&
                              state.currentPersona.name.toLowerCase() === ticket.createdBy.toLowerCase();

    if (isCreatorEmployee && !isClosed) {
      startEditBtn.style.display = 'inline-flex';
    } else {
      startEditBtn.style.display = 'none';
    }

    // Default to view mode
    viewModeContainer.style.display = 'flex';
    editModeContainer.style.display = 'none';

    // Status management controls
    if (state.currentPersona.role === 'Support Staff') {
      supportStatusControls.style.display = 'flex';
      employeeStatusNotice.style.display = 'none';
      updateStatusPillButtons(ticket.status);
    } else {
      supportStatusControls.style.display = 'none';
      employeeStatusNotice.style.display = 'block';
    }

    // Comments feed
    renderComments(ticket.comments || []);
    commentTextInput.value = '';

    detailModal.style.display = 'flex';
  }

  function closeDetailModal() {
    detailModal.style.display = 'none';
    state.activeTicket = null;
  }

  closeDetailBtn.addEventListener('click', closeDetailModal);

  // Stepper Visual Updates
  function updateStepper(status) {
    const steps = ['Open', 'In Progress', 'Resolved', 'Closed'];
    const activeIdx = steps.indexOf(status);

    const stepElements = [stepOpen, stepProgress, stepResolved, stepClosed];
    const lineElements = [line1, line2, line3];

    stepElements.forEach((el, idx) => {
      el.className = 'step-item';
      if (idx === activeIdx) {
        el.classList.add('step-active');
      } else if (idx < activeIdx) {
        el.classList.add('step-completed');
      }
    });

    lineElements.forEach((line, idx) => {
      line.className = 'step-line';
      if (idx < activeIdx) {
        line.classList.add('line-completed');
      }
    });
  }

  // Update Status Pill Active Class
  function updateStatusPillButtons(currentStatus) {
    const pills = supportStatusControls.querySelectorAll('.btn-status-pill');
    pills.forEach(pill => {
      if (pill.getAttribute('data-status') === currentStatus) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Status Change Click Handler (Support Staff only)
  supportStatusControls.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('btn-status-pill')) return;
    const newStatus = e.target.getAttribute('data-status');
    if (!state.activeTicket || state.activeTicket.status === newStatus) return;

    try {
      const res = await apiFetch(`/api/tickets/${state.activeTicket.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      showToast(`Status updated to ${newStatus}`, 'success');
      state.activeTicket = res.ticket;
      openDetailModal(res.ticket);
      await loadAndRenderTickets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Edit Mode Toggle
  startEditBtn.addEventListener('click', () => {
    if (!state.activeTicket) return;
    editTitleInput.value = state.activeTicket.title;
    editTitleCharCount.textContent = `${state.activeTicket.title.length}/100`;
    editCategorySelect.value = state.activeTicket.category;
    editPrioritySelect.value = state.activeTicket.priority;
    editDescInput.value = state.activeTicket.description;

    viewModeContainer.style.display = 'none';
    editModeContainer.style.display = 'flex';
    editTitleInput.focus();
  });

  cancelEditBtn.addEventListener('click', () => {
    editModeContainer.style.display = 'none';
    viewModeContainer.style.display = 'flex';
  });

  editTitleInput.addEventListener('input', (e) => {
    const len = e.target.value.length;
    editTitleCharCount.textContent = `${len}/100`;
  });

  editModeContainer.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.activeTicket) return;

    const title = editTitleInput.value.trim();
    const description = editDescInput.value.trim();
    const category = editCategorySelect.value;
    const priority = editPrioritySelect.value;

    if (!title || !description) {
      showToast('Title and description cannot be empty.', 'error');
      return;
    }

    try {
      const res = await apiFetch(`/api/tickets/${state.activeTicket.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, category, priority })
      });

      showToast('Ticket request updated successfully.', 'success');
      state.activeTicket = res.ticket;
      openDetailModal(res.ticket);
      await loadAndRenderTickets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ==============================================================
  // Comments Flow
  // ==============================================================
  function renderComments(comments) {
    commentsList.innerHTML = '';
    commentCountBadge.textContent = `${comments.length} comment${comments.length === 1 ? '' : 's'}`;

    if (comments.length === 0) {
      commentsList.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 8px 0;">No comments yet. Start the conversation below.</div>`;
      return;
    }

    comments.forEach(c => {
      const isSupport = c.role === 'Support Staff';
      const card = document.createElement('div');
      card.className = `comment-card ${isSupport ? 'comment-card-support' : ''}`;
      card.innerHTML = `
        <div class="comment-meta">
          <div class="comment-author-wrap">
            <span>${getUserAvatar(c.author)}</span>
            <span class="comment-author-name">${c.author}</span>
            <span class="role-badge ${isSupport ? 'role-support' : 'role-employee'}">${c.role}</span>
          </div>
          <span class="comment-timestamp">${c.createdAt}</span>
        </div>
        <div class="comment-body">${escapeHTML(c.text)}</div>
      `;
      commentsList.appendChild(card);
    });

    // Auto-scroll to bottom of comment thread
    commentsList.scrollTop = commentsList.scrollHeight;
  }

  addCommentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitComment();
  });

  // Ctrl + Enter shortcut for comment submission
  commentTextInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      submitComment();
    }
  });

  async function submitComment() {
    if (!state.activeTicket) return;
    const text = commentTextInput.value.trim();
    if (!text) {
      showToast('Comment text cannot be empty.', 'error');
      return;
    }

    try {
      const res = await apiFetch(`/api/tickets/${state.activeTicket.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });

      showToast('Comment added!', 'success');
      commentTextInput.value = '';

      // Reload ticket from server to get updated lastUpdatedDate and comments
      const updatedTicketData = await apiFetch(`/api/tickets/${state.activeTicket.id}`);
      state.activeTicket = updatedTicketData.ticket;
      openDetailModal(updatedTicketData.ticket);
      await loadAndRenderTickets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ==============================================================
  // Reset Demo Modal Flow
  // ==============================================================
  resetDemoBtn.addEventListener('click', () => {
    resetModal.style.display = 'flex';
  });

  function closeResetModal() {
    resetModal.style.display = 'none';
  }

  closeResetModalBtn.addEventListener('click', closeResetModal);
  cancelResetBtn.addEventListener('click', closeResetModal);

  confirmResetBtn.addEventListener('click', async () => {
    try {
      await apiFetch('/api/reset', { method: 'POST' });
      showToast('Sample data reset to original 5 tickets!', 'success');
      closeResetModal();
      if (detailModal.style.display === 'flex') {
        closeDetailModal();
      }
      await loadAndRenderTickets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ==============================================================
  // Global Keyboard Shortcuts (Escape to close modals)
  // ==============================================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (newTicketModal.style.display === 'flex') closeNewModal();
      if (detailModal.style.display === 'flex') closeDetailModal();
      if (resetModal.style.display === 'flex') closeResetModal();
    }
  });

  // Close modals when clicking backdrop
  [newTicketModal, detailModal, resetModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        if (modal === detailModal) state.activeTicket = null;
      }
    });
  });

  // Run app
  init();
});
