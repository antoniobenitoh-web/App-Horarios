// Mock database initialization and seeding with Contract Hours and Schedule Statuses
const MOCK_USERS = [
  {
    id: 'promotor1',
    username: 'promotor1',
    password: 'password123',
    name: 'Pedro Gómez',
    role: 'promotor',
    zone: 'Norte',
    gpvId: 'gpv1',
    amId: 'am1',
    coordId: 'coord1',
    email: 'pedro.gomez@empresa.com',
    contract_hours: 40
  },
  {
    id: 'promotor2',
    username: 'promotor2',
    password: 'password123',
    name: 'Laura Ruiz',
    role: 'promotor',
    zone: 'Norte',
    gpvId: 'gpv1',
    amId: 'am1',
    coordId: 'coord1',
    email: 'laura.ruiz@empresa.com',
    contract_hours: 35
  },
  {
    id: 'promotor3',
    username: 'promotor3',
    password: 'password123',
    name: 'Javier López',
    role: 'promotor',
    zone: 'Sur',
    gpvId: 'gpv2',
    amId: 'am1',
    coordId: 'coord1',
    email: 'javier.lopez@empresa.com',
    contract_hours: 40
  },
  {
    id: 'promotor4',
    username: 'promotor4',
    password: 'password123',
    name: 'Sofía Torres',
    role: 'promotor',
    zone: 'Sur',
    gpvId: 'gpv2',
    amId: 'am1',
    coordId: 'coord1',
    email: 'sofia.torres@empresa.com',
    contract_hours: 20
  },
  {
    id: 'gpv1',
    username: 'gpv1',
    password: 'password123',
    name: 'Carlos GPV Norte',
    role: 'gpv',
    zone: 'Norte',
    email: 'carlos.gpv@empresa.com'
  },
  {
    id: 'gpv2',
    username: 'gpv2',
    password: 'password123',
    name: 'Marta GPV Sur',
    role: 'gpv',
    zone: 'Sur',
    email: 'marta.gpv@empresa.com'
  },
  {
    id: 'am1',
    username: 'am1',
    password: 'password123',
    name: 'Ana Area Manager',
    role: 'am',
    email: 'ana.am@empresa.com'
  },
  {
    id: 'coord1',
    username: 'coord1',
    password: 'password123',
    name: 'Elena Coordinadora',
    role: 'coordinadora',
    email: 'elena.coord@empresa.com'
  }
];

const INITIAL_SCHEDULES = [
  // Pedro Gómez (promotor1) - 40h contract: Has 5 shifts * 8h = 40h total. Statuses: 2 conformed, 2 published (unsigned), 1 draft (unpublished)
  { id: 'sch1', promotorId: 'promotor1', date: '2026-06-15', shift: '09:00 - 17:00', location: 'Carrefour Centro', status: 'conformed', conformedAt: '2026-06-11 09:30' },
  { id: 'sch2', promotorId: 'promotor1', date: '2026-06-16', shift: '09:00 - 17:00', location: 'Carrefour Centro', status: 'conformed', conformedAt: '2026-06-11 09:30' },
  { id: 'sch3', promotorId: 'promotor1', date: '2026-06-17', shift: '09:00 - 17:00', location: 'Carrefour Centro', status: 'published', conformedAt: null },
  { id: 'sch4', promotorId: 'promotor1', date: '2026-06-18', shift: '09:00 - 17:00', location: 'Carrefour Centro', status: 'published', conformedAt: null },
  { id: 'sch5', promotorId: 'promotor1', date: '2026-06-19', shift: '09:00 - 17:00', location: 'Carrefour Centro', status: 'draft', conformedAt: null },
  
  // Laura Ruiz (promotor2) - 35h contract: Has 3 shifts * 8h = 24h. Status: Published
  { id: 'sch6', promotorId: 'promotor2', date: '2026-06-15', shift: '10:00 - 18:00', location: 'El Corte Inglés Castellana', status: 'published', conformedAt: null },
  { id: 'sch7', promotorId: 'promotor2', date: '2026-06-16', shift: '10:00 - 18:00', location: 'El Corte Inglés Castellana', status: 'published', conformedAt: null },
  { id: 'sch8', promotorId: 'promotor2', date: '2026-06-17', shift: '10:00 - 18:00', location: 'El Corte Inglés Castellana', status: 'published', conformedAt: null },
  
  // Javier López (promotor3) - 40h contract: 3 shifts * 9h = 27h. Status: Conformed
  { id: 'sch9', promotorId: 'promotor3', date: '2026-06-15', shift: '09:00 - 18:00', location: 'MediaMarkt Diagonal', status: 'conformed', conformedAt: '2026-06-10 18:15' },
  { id: 'sch10', promotorId: 'promotor3', date: '2026-06-16', shift: '09:00 - 18:00', location: 'MediaMarkt Diagonal', status: 'conformed', conformedAt: '2026-06-10 18:15' },
  { id: 'sch11', promotorId: 'promotor3', date: '2026-06-17', shift: '09:00 - 18:00', location: 'MediaMarkt Diagonal', status: 'conformed', conformedAt: '2026-06-10 18:15' },
  
  // Sofía Torres (promotor4) - 20h contract: 2 shifts * 8h = 16h. Status: Published
  { id: 'sch12', promotorId: 'promotor4', date: '2026-06-15', shift: '11:00 - 19:00', location: 'Fnac Triangle', status: 'published', conformedAt: null },
  { id: 'sch13', promotorId: 'promotor4', date: '2026-06-16', shift: '11:00 - 19:00', location: 'Fnac Triangle', status: 'published', conformedAt: null }
];

const INITIAL_REQUESTS = [
  {
    id: 'req1',
    promotorId: 'promotor2',
    promotorName: 'Laura Ruiz',
    zone: 'Norte',
    date: '2026-06-16',
    originalShift: '10:00 - 18:00',
    requestedShift: '09:00 - 17:00',
    reason: 'Cita médica preferente por la mañana.',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    createdAt: '2026-06-11 10:00'
  },
  {
    id: 'req2',
    promotorId: 'promotor3',
    promotorName: 'Javier López',
    zone: 'Sur',
    date: '2026-06-15',
    originalShift: '09:00 - 18:00',
    requestedShift: '09:00 - 15:00',
    reason: 'Examen de curso de formación.',
    status: 'approved',
    reviewedBy: 'Elena Coordinadora',
    reviewedAt: '2026-06-11 11:20',
    createdAt: '2026-06-11 08:30'
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'log1',
    user: 'Elena Coordinadora',
    role: 'coordinadora',
    action: 'CREACION_HORARIO',
    details: 'Horario creado para Laura Ruiz el 2026-06-15',
    timestamp: '2026-06-11 09:00'
  },
  {
    id: 'log2',
    user: 'Pedro Gómez',
    role: 'promotor',
    action: 'FIRMA_CONFORMIDAD',
    details: 'Firma registrada para el turno del 2026-06-15',
    timestamp: '2026-06-11 09:30'
  },
  {
    id: 'log3',
    user: 'Elena Coordinadora',
    role: 'coordinadora',
    action: 'APROBACION_CAMBIO',
    details: 'Aprobó solicitud de cambio de Javier López para el 2026-06-15',
    timestamp: '2026-06-11 11:20'
  }
];

// Helper to interact with LocalStorage database
const db = {
  get(key, defaultValue) {
    const data = localStorage.getItem(`schedule_app_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  },
  set(key, value) {
    localStorage.setItem(`schedule_app_${key}`, JSON.stringify(value));
  },
  init() {
    if (!localStorage.getItem('schedule_app_users')) {
      this.set('users', MOCK_USERS);
    }
    if (!localStorage.getItem('schedule_app_schedules')) {
      this.set('schedules', INITIAL_SCHEDULES);
    }
    if (!localStorage.getItem('schedule_app_requests')) {
      this.set('requests', INITIAL_REQUESTS);
    }
    if (!localStorage.getItem('schedule_app_audit_logs')) {
      this.set('audit_logs', INITIAL_AUDIT_LOGS);
    }
  }
};

// Initialize DB
db.init();

// App State
let currentUser = db.get('session_user', null);
let selectedPromoterId = null; 

// Utility functions
function formatDate(dateStr) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', options);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `badge badge-${type}`;
  toast.style.position = 'fixed';
  toast.style.bottom = '2rem';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '0.75rem 1.5rem';
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)';
  toast.style.fontSize = '0.9rem';
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Write to Audit Logs helper
function logAction(action, details) {
  const logs = db.get('audit_logs', []);
  const now = new Date();
  const timestamp = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0') + ' ' + 
    String(now.getHours()).padStart(2, '0') + ':' + 
    String(now.getMinutes()).padStart(2, '0');

  const newLog = {
    id: 'log_' + Date.now(),
    user: currentUser ? currentUser.name : 'Sistema',
    role: currentUser ? currentUser.role : 'sistema',
    action: action,
    details: details,
    timestamp: timestamp
  };

  logs.unshift(newLog); // New logs at top
  db.set('audit_logs', logs);
}

// Split and calculate hours
function calculateShiftHours(shift) {
  if (!shift) return 0;
  const parts = shift.split('-');
  if (parts.length !== 2) return 8; // Fallback
  try {
    const t1 = parts[0].trim().split(':');
    const t2 = parts[1].trim().split(':');
    const h1 = parseInt(t1[0]) + (parseInt(t1[1] || 0) / 60);
    const h2 = parseInt(t2[0]) + (parseInt(t2[1] || 0) / 60);
    return Math.max(0, h2 - h1);
  } catch (e) {
    return 8;
  }
}

// Router & Screen Switcher
function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.add('hidden');
  });

  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
  }

  updateNavbar();
}

function updateNavbar() {
  const header = document.getElementById('app-header');
  if (currentUser) {
    header.classList.remove('hidden');
    document.getElementById('nav-user-name').innerText = currentUser.name;
    document.getElementById('nav-user-role').innerText = currentUser.role;
  } else {
    header.classList.add('hidden');
  }
}

// Authentication Handlers
function handleLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('login-username').value.trim();
  const passwordInput = document.getElementById('login-password').value;

  const users = db.get('users', []);
  const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

  if (user) {
    currentUser = user;
    db.set('session_user', user);
    showToast(`¡Bienvenido/a, ${user.name}!`);
    routeToDashboard(user);
  } else {
    showToast('Usuario o contraseña incorrectos', 'danger');
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('schedule_app_session_user');
  document.getElementById('login-form').reset();
  showScreen('screen-login');
  showToast('Sesión cerrada con éxito');
}

function routeToDashboard(user) {
  if (user.role === 'promotor') {
    renderPromotorDashboard();
    showScreen('screen-promotor');
  } else if (user.role === 'gpv') {
    renderGPVDashboard();
    showScreen('screen-gpv');
  } else if (user.role === 'am' || user.role === 'coordinadora' || user.role === 'administradora') {
    renderManagerDashboard();
    showScreen('screen-manager');
  }
}

// Demo quick account switcher
window.switchUser = function(username) {
  const users = db.get('users', []);
  const user = users.find(u => u.username === username);
  if (user) {
    currentUser = user;
    db.set('session_user', user);
    showToast(`Cambiado a rol: ${user.role.toUpperCase()} (${user.name})`);
    routeToDashboard(user);
  }
};

// ----------------------------------------------------
// PROMOTOR DASHBOARD VIEW
// ----------------------------------------------------
function renderPromotorDashboard() {
  const schedules = db.get('schedules', []);
  const users = db.get('users', []);
  const requests = db.get('requests', []);

  // Filter schedules for this promoter
  const mySchedules = schedules.filter(s => s.promotorId === currentUser.id);

  // Check if they have ANY unsigned 'published' schedules. If yes, BLOCK actions.
  const hasUnsignedSchedules = mySchedules.some(s => s.status === 'published');

  // Lectura Obligatoria blocking banner display
  const blockingBanner = document.getElementById('promotor-blocking-banner');
  if (hasUnsignedSchedules) {
    blockingBanner.classList.remove('hidden');
  } else {
    blockingBanner.classList.add('hidden');
  }

  // Calculate planned hours balance
  // Include both published and conformed schedules in total planned hours
  let totalPlannedHours = 0;
  mySchedules.forEach(s => {
    if (s.status === 'published' || s.status === 'conformed') {
      totalPlannedHours += calculateShiftHours(s.shift);
    }
  });

  const contractHours = currentUser.contract_hours || 40;
  const balance = totalPlannedHours - contractHours;

  document.getElementById('promotor-contract-hours').innerText = `${contractHours}h`;
  document.getElementById('promotor-planned-hours').innerText = `${totalPlannedHours}h`;
  
  const balanceEl = document.getElementById('promotor-balance-hours');
  balanceEl.innerText = `${balance >= 0 ? '+' : ''}${balance}h`;
  if (balance === 0) {
    balanceEl.style.color = 'var(--success)';
  } else if (balance > 0) {
    balanceEl.style.color = 'var(--warning)';
  } else {
    balanceEl.style.color = 'var(--danger)';
  }

  // Render contacts (GPV, AM, Coordinadora)
  const gpv = users.find(u => u.id === currentUser.gpvId);
  const am = users.find(u => u.id === currentUser.amId);
  const coord = users.find(u => u.id === currentUser.coordId);

  const contactContainer = document.getElementById('promotor-contacts');
  contactContainer.innerHTML = `
    <div class="contact-card">
      <div class="contact-label">Gestor de Punto de Venta (GPV)</div>
      <div class="contact-name">${gpv ? gpv.name : 'No asignado'}</div>
      <div class="contact-detail">📧 ${gpv ? gpv.email : '-'}</div>
      <div class="contact-detail">📍 Zona: ${currentUser.zone}</div>
    </div>
    <div class="contact-card">
      <div class="contact-label">Area Manager (AM)</div>
      <div class="contact-name">${am ? am.name : 'No asignado'}</div>
      <div class="contact-detail">📧 ${am ? am.email : '-'}</div>
    </div>
    <div class="contact-card">
      <div class="contact-label">Coordinadora</div>
      <div class="contact-name">${coord ? coord.name : 'No asignada'}</div>
      <div class="contact-detail">📧 ${coord ? coord.email : '-'}</div>
    </div>
  `;

  // Render Schedule table with Semáforo Color Code
  const tbody = document.getElementById('promotor-schedule-tbody');
  tbody.innerHTML = '';

  if (mySchedules.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No tienes horarios asignados para esta semana.</td></tr>`;
  } else {
    mySchedules.forEach(s => {
      // Determine Semáforo Class & Badge
      let rowClass = 'row-draft';
      let statusBadge = `<span class="badge badge-draft">Draft (Borrador)</span>`;

      if (s.status === 'published') {
        rowClass = 'row-published';
        statusBadge = `<span class="badge badge-info">Publicado / Pendiente Firma</span>`;
      } else if (s.status === 'conformed') {
        rowClass = 'row-conformed';
        statusBadge = `<span class="badge badge-success">✓ Leído y Conforme</span>`;
      }

      // Actions logic: Disable change requests if blocking signature is true
      const isConformed = s.status === 'conformed';
      const isDraft = s.status === 'draft';

      const signBtn = s.status === 'published'
        ? `<button class="btn btn-sm btn-success" onclick="signSchedule('${s.id}')">Firmar Conformidad</button>`
        : `<button class="btn btn-sm btn-secondary" disabled>${isConformed ? 'Firmado' : 'Borrador'}</button>`;

      const reqBtn = (isDraft || hasUnsignedSchedules)
        ? `<button class="btn btn-sm btn-secondary" disabled title="Firme las conformidades pendientes para poder solicitar cambios">Solicitar Cambio</button>`
        : `<button class="btn btn-sm btn-secondary" onclick="openRequestModal('${s.id}', '${s.date}', '${s.shift}')">Solicitar Cambio</button>`;

      const tr = document.createElement('tr');
      tr.className = rowClass;
      tr.innerHTML = `
        <td style="font-weight: 600;">${formatDate(s.date)}</td>
        <td>${s.shift} <span style="font-size:0.75rem; color:var(--text-muted);">(${calculateShiftHours(s.shift)}h)</span></td>
        <td>${s.location}</td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            ${signBtn}
            ${reqBtn}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Render My Requests List
  const reqList = document.getElementById('promotor-requests-list');
  reqList.innerHTML = '';
  const myRequests = requests.filter(r => r.promotorId === currentUser.id);

  if (myRequests.length === 0) {
    reqList.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1rem;">No tienes solicitudes de cambio registradas.</div>`;
  } else {
    myRequests.forEach(r => {
      let statusClass = 'warning';
      let statusLabel = 'Pendiente';
      if (r.status === 'approved') {
        statusClass = 'success';
        statusLabel = 'Aprobado';
      } else if (r.status === 'rejected') {
        statusClass = 'danger';
        statusLabel = 'Rechazado';
      }

      const card = document.createElement('div');
      card.className = 'contact-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div class="contact-label">Fecha del cambio: ${r.date}</div>
          <span class="badge badge-${statusClass}">${statusLabel}</span>
        </div>
        <div style="font-size: 0.85rem; margin-top: 0.25rem;">
          <strong>De:</strong> ${r.originalShift} ➔ <strong>A:</strong> ${r.requestedShift}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
          <em>Motivo: ${r.reason}</em>
        </div>
        ${r.reviewedBy ? `
          <div style="font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); margin-top: 0.5rem; padding-top: 0.5rem;">
            Revisado por: ${r.reviewedBy} el ${r.reviewedAt}
          </div>
        ` : ''}
      `;
      reqList.appendChild(card);
    });
  }
}

window.signSchedule = function(scheduleId) {
  const schedules = db.get('schedules', []);
  const index = schedules.findIndex(s => s.id === scheduleId);
  if (index !== -1) {
    const now = new Date();
    const formattedDate = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + ' ' + 
      String(now.getHours()).padStart(2, '0') + ':' + 
      String(now.getMinutes()).padStart(2, '0');
      
    schedules[index].status = 'conformed';
    schedules[index].conformedAt = formattedDate;
    db.set('schedules', schedules);

    logAction('FIRMA_CONFORMIDAD', `Pedro Gómez firmó conformidad para el turno del ${schedules[index].date}`);
    showToast('Firma de conformidad registrada con éxito');
    renderPromotorDashboard();
  }
};

window.signAllPending = function() {
  const schedules = db.get('schedules', []);
  let count = 0;
  schedules.forEach(s => {
    if (s.promotorId === currentUser.id && s.status === 'published') {
      const now = new Date();
      s.status = 'conformed';
      s.conformedAt = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      count++;
    }
  });

  if (count > 0) {
    db.set('schedules', schedules);
    logAction('FIRMA_CONFORMIDAD', `${currentUser.name} firmó la conformidad de ${count} turnos pendientes`);
    showToast(`Se firmaron ${count} turnos con éxito`);
    renderPromotorDashboard();
  }
};

window.openRequestModal = function(scheduleId, date, originalShift) {
  document.getElementById('req-modal-sch-id').value = scheduleId;
  document.getElementById('req-modal-date').value = date;
  document.getElementById('req-modal-date-display').innerText = formatDate(date);
  document.getElementById('req-modal-original').value = originalShift;
  document.getElementById('req-modal-requested').value = '';
  document.getElementById('req-modal-reason').value = '';

  document.getElementById('request-modal').classList.remove('hidden');
};

window.closeRequestModal = function() {
  document.getElementById('request-modal').classList.add('hidden');
};

window.submitChangeRequest = function(e) {
  e.preventDefault();
  const scheduleId = document.getElementById('req-modal-sch-id').value;
  const date = document.getElementById('req-modal-date').value;
  const originalShift = document.getElementById('req-modal-original').value;
  const requestedShift = document.getElementById('req-modal-requested').value.trim();
  const reason = document.getElementById('req-modal-reason').value.trim();

  if (!requestedShift || !reason) {
    showToast('Por favor, completa todos los campos del formulario.', 'danger');
    return;
  }

  const requests = db.get('requests', []);
  const now = new Date();
  const formattedDate = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0') + ' ' + 
    String(now.getHours()).padStart(2, '0') + ':' + 
    String(now.getMinutes()).padStart(2, '0');

  const newRequest = {
    id: 'req_' + Date.now(),
    promotorId: currentUser.id,
    promotorName: currentUser.name,
    zone: currentUser.zone,
    date: date,
    originalShift: originalShift,
    requestedShift: requestedShift,
    reason: reason,
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    createdAt: formattedDate
  };

  requests.push(newRequest);
  db.set('requests', requests);

  logAction('SOLICITUD_CAMBIO', `${currentUser.name} solicitó cambiar el turno del ${date} a ${requestedShift}`);
  showToast('Solicitud de cambio enviada con éxito');
  closeRequestModal();
  renderPromotorDashboard();
};

// ----------------------------------------------------
// GPV DASHBOARD VIEW
// ----------------------------------------------------
function renderGPVDashboard() {
  const users = db.get('users', []);
  const schedules = db.get('schedules', []);
  const requests = db.get('requests', []);

  const zonePromoters = users.filter(u => u.role === 'promotor' && String(u.manager?.gpv).toLowerCase() === String(currentUser.name).toLowerCase());

  document.getElementById('gpv-zone-name').innerText = currentUser.region || 'Asignada';
  document.getElementById('gpv-stat-promoters').innerText = zonePromoters.length;

  const zoneSchedules = schedules.filter(s => zonePromoters.some(p => p.id === s.promotorId));
  const conformedCount = zoneSchedules.filter(s => s.status === 'conformed').length;
  document.getElementById('gpv-stat-conformed').innerText = `${conformedCount}/${zoneSchedules.length}`;

  const zoneRequests = requests.filter(r => zonePromoters.some(p => p.id === r.promotorId));
  const pendingRequests = zoneRequests.filter(r => r.status === 'pending');
  document.getElementById('gpv-stat-requests').innerText = pendingRequests.length;

  const plist = document.getElementById('gpv-promoters-list');
  plist.innerHTML = '';

  if (zonePromoters.length === 0) {
    plist.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1rem;">No hay promotores en tu zona.</div>`;
    document.getElementById('gpv-detail-placeholder').classList.remove('hidden');
    document.getElementById('gpv-detail-content').classList.add('hidden');
  } else {
    if (!selectedPromoterId || !zonePromoters.some(p => p.id === selectedPromoterId)) {
      selectedPromoterId = zonePromoters[0].id;
    }

    zonePromoters.forEach(p => {
      const div = document.createElement('div');
      div.className = `promoter-row ${p.id === selectedPromoterId ? 'active' : ''}`;
      div.onclick = () => {
        selectedPromoterId = p.id;
        renderGPVDashboard();
      };
      
      const pSchedules = schedules.filter(s => s.promotorId === p.id);
      const pendingS = pSchedules.filter(s => s.status === 'published').length;

      div.innerHTML = `
        <div>
          <div style="font-weight:600;">${p.name}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">${p.email}</div>
        </div>
        ${pendingS > 0 
          ? `<span class="badge badge-warning" style="padding: 0.15rem 0.4rem; font-size: 0.65rem;">${pendingS} sin firmar</span>` 
          : `<span class="badge badge-success" style="padding: 0.15rem 0.4rem; font-size: 0.65rem;">Al día</span>`}
      `;
      plist.appendChild(div);
    });

    renderGPVPromoterDetails(selectedPromoterId);
  }

  const reqContainer = document.getElementById('gpv-zone-requests');
  reqContainer.innerHTML = '';

  if (zoneRequests.length === 0) {
    reqContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem; font-size: 0.85rem;">No hay solicitudes en esta zona.</div>`;
  } else {
    zoneRequests.forEach(r => {
      let statusClass = 'warning';
      let statusLabel = 'Pendiente';
      if (r.status === 'approved') {
        statusClass = 'success';
        statusLabel = 'Aprobado';
      } else if (r.status === 'rejected') {
        statusClass = 'danger';
        statusLabel = 'Rechazado';
      }

      const card = document.createElement('div');
      card.className = 'contact-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: var(--text-primary); font-size:0.9rem;">${r.promotorName}</strong>
          <span class="badge badge-${statusClass}">${statusLabel}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.25rem;">
          Fecha: ${r.date} | ${r.originalShift} ➔ ${r.requestedShift}
        </div>
        <div style="font-size:0.8rem; margin-top:0.25rem; font-style:italic;">
          Motivo: ${r.reason}
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem; display:flex; justify-content:space-between;">
          <span>Creado: ${r.createdAt}</span>
          ${r.reviewedBy ? `<span>Revisó: ${r.reviewedBy}</span>` : `<span style="color: var(--warning);">Requiere aprobación de Coordinación</span>`}
        </div>
      `;
      reqContainer.appendChild(card);
    });
  }
}

function renderGPVPromoterDetails(promoterId) {
  document.getElementById('gpv-detail-placeholder').classList.add('hidden');
  const detailsContent = document.getElementById('gpv-detail-content');
  detailsContent.classList.remove('hidden');

  const users = db.get('users', []);
  const schedules = db.get('schedules', []);
  
  const promoter = users.find(u => u.id === promoterId);
  const promoterSchedules = schedules.filter(s => s.promotorId === promoterId);

  document.getElementById('gpv-detail-name').innerText = promoter.name;
  document.getElementById('gpv-detail-email').innerText = promoter.email;
  document.getElementById('gpv-detail-zone').innerText = promoter.zone;

  // Render stats / Balance
  let planned = 0;
  promoterSchedules.forEach(s => {
    if (s.status === 'published' || s.status === 'conformed') {
      planned += calculateShiftHours(s.shift);
    }
  });
  const contract = promoter.contract_hours || 40;
  const balance = planned - contract;

  document.getElementById('gpv-detail-contract-hours').innerText = `${contract}h`;
  document.getElementById('gpv-detail-planned-hours').innerText = `${planned}h`;
  const balEl = document.getElementById('gpv-detail-balance-hours');
  balEl.innerText = `${balance >= 0 ? '+' : ''}${balance}h`;
  balEl.style.color = balance === 0 ? 'var(--success)' : (balance > 0 ? 'var(--warning)' : 'var(--danger)');

  const tbody = document.getElementById('gpv-detail-schedules-tbody');
  tbody.innerHTML = '';

  if (promoterSchedules.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Sin horarios registrados.</td></tr>`;
  } else {
    promoterSchedules.forEach(s => {
      let trClass = 'row-draft';
      let statusBadge = `<span class="badge badge-draft">Draft</span>`;
      if (s.status === 'published') {
        trClass = 'row-published';
        statusBadge = `<span class="badge badge-info">Publicado / Pendiente</span>`;
      } else if (s.status === 'conformed') {
        trClass = 'row-conformed';
        statusBadge = `<span class="badge badge-success">✓ Conforme</span>`;
      }

      const tr = document.createElement('tr');
      tr.className = trClass;
      tr.innerHTML = `
        <td>${formatDate(s.date)}</td>
        <td>${s.shift} (${calculateShiftHours(s.shift)}h)</td>
        <td>${s.location}</td>
        <td>${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// ----------------------------------------------------
// MANAGER DASHBOARD VIEW (AM / Coordinadora / Administradora)
// ----------------------------------------------------
function renderManagerDashboard() {
  const users = db.get('users', []);
  const schedules = db.get('schedules', []);
  const requests = db.get('requests', []);

  const titleEl = document.getElementById('manager-title-role');
  if (titleEl) {
    if (currentUser.role === 'administradora') titleEl.innerText = '🌍 Nivel Nacional';
    else if (currentUser.role === 'coordinadora') titleEl.innerText = '👥 Mi Equipo (Coordinación)';
    else titleEl.innerText = '👥 Mi Región (AM)';
  }

  // Filter logic based on role
  let myTeam = [];
  if (currentUser.role === 'administradora') {
    myTeam = users.filter(u => ['promotor', 'gpv', 'am', 'coordinadora'].includes(u.role) && u.id !== currentUser.id);
  } else if (currentUser.role === 'coordinadora') {
    myTeam = users.filter(u => ['promotor', 'gpv', 'am'].includes(u.role) && String(u.manager?.coordinadora).toLowerCase() === String(currentUser.name).toLowerCase());
  } else if (currentUser.role === 'am') {
    myTeam = users.filter(u => ['promotor', 'gpv'].includes(u.role) && String(u.manager?.am).toLowerCase() === String(currentUser.name).toLowerCase());
  }

  // Regional Filter Logic
  const regionSelect = document.getElementById('manager-region-filter');
  const currentRegion = regionSelect.value;
  
  // Populate region select
  const uniqueRegions = [...new Set(myTeam.map(p => p.region).filter(Boolean))];
  if (regionSelect.options.length <= 1 || regionSelect.dataset.populated !== "true") {
    regionSelect.innerHTML = '<option value="all">Todas mis regiones</option>';
    uniqueRegions.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.innerText = r;
      if (r === currentRegion) opt.selected = true;
      regionSelect.appendChild(opt);
    });
    regionSelect.dataset.populated = "true";
    regionSelect.onchange = () => renderManagerDashboard();
  }

  // Apply filter
  const filteredPromoters = currentRegion === 'all' 
    ? myTeam 
    : myTeam.filter(p => p.region === currentRegion);

  // Stats
  document.getElementById('manager-stat-promoters').innerText = filteredPromoters.length;
  
  const filteredPromoterIds = filteredPromoters.map(p => p.id);
  const relevantSchedules = schedules.filter(s => filteredPromoterIds.includes(s.promotorId));
  const conformedCount = relevantSchedules.filter(s => s.status === 'conformed').length;
  document.getElementById('manager-stat-conformed').innerText = `${conformedCount}/${relevantSchedules.length}`;
  
  const pendingRequests = requests.filter(r => r.status === 'pending' && filteredPromoterIds.includes(r.promotorId));
  document.getElementById('manager-stat-requests').innerText = pendingRequests.length;

  // Render sidebar list
  const plist = document.getElementById('manager-promoters-list');
  plist.innerHTML = '';

  if (filteredPromoters.length === 0) {
    plist.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem;">No hay personal en esta vista.</div>`;
    document.getElementById('manager-detail-placeholder').classList.remove('hidden');
    document.getElementById('manager-detail-content').classList.add('hidden');
  } else {
    if (!selectedPromoterId || !filteredPromoters.some(p => p.id === selectedPromoterId)) {
      selectedPromoterId = filteredPromoters[0].id;
    }

    filteredPromoters.forEach(p => {
      const div = document.createElement('div');
      div.className = `promoter-row ${p.id === selectedPromoterId ? 'active' : ''}`;
      div.onclick = () => {
        selectedPromoterId = p.id;
        renderManagerDashboard();
      };
      
      const pSchedules = schedules.filter(s => s.promotorId === p.id);
      const conf = pSchedules.filter(s => s.status === 'conformed').length;
      
      div.innerHTML = `
        <div class="promoter-name">${p.name}</div>
        <div class="promoter-meta">Rol: ${p.role.toUpperCase()} • Región: ${p.region || 'N/A'} • Horarios: ${conf}/${pSchedules.length}</div>
      `;
      plist.appendChild(div);
    });

    renderManagerPromoterDetails(selectedPromoterId);
  }

  // Render requests log with role-based actions
  const reqContainer = document.getElementById('manager-pending-requests');
  if (reqContainer) {
    reqContainer.innerHTML = '';

    if (requests.length === 0) {
      reqContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem;">No hay solicitudes registradas.</div>`;
    } else {
      // Filter requests to show only those belonging to the managed team
      const teamRequests = requests.filter(r => filteredPromoterIds.includes(r.promotorId));
      
      if (teamRequests.length === 0) {
        reqContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem;">No hay solicitudes registradas.</div>`;
      } else {
        teamRequests.forEach(r => {
          let statusClass = 'warning';
          let statusLabel = 'Pendiente';
          if (r.status === 'approved') {
            statusClass = 'success';
            statusLabel = 'Aprobado';
          } else if (r.status === 'rejected') {
            statusClass = 'danger';
            statusLabel = 'Rechazado';
          }

          let actions = '';
          if (r.status === 'pending') {
            if (currentUser.role === 'administradora' || currentUser.role === 'coordinadora') {
              actions = `
                <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
                  <button class="btn btn-sm btn-success" onclick="reviewRequest('${r.id}', 'approved')">Aprobar (Final)</button>
                  <button class="btn btn-sm btn-danger" onclick="reviewRequest('${r.id}', 'rejected')">Rechazar (Final)</button>
                </div>
              `;
            } else if (currentUser.role === 'am' || currentUser.role === 'gpv') {
              actions = `
                <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
                  <button class="btn btn-sm btn-outline" style="border-color:var(--success); color:var(--success);" onclick="proposeRequest('${r.id}', 'approve')">Proponer Aprobar</button>
                  <button class="btn btn-sm btn-outline" style="border-color:var(--danger); color:var(--danger);" onclick="proposeRequest('${r.id}', 'reject')">Proponer Rechazar</button>
                </div>
              `;
            }
          }

          // Visual cue for proposals
          let proposalMeta = '';
          if (r.amProposal) {
            const color = r.amProposal === 'approve' ? 'var(--success)' : 'var(--danger)';
            const text = r.amProposal === 'approve' ? 'Propone APROBAR' : 'Propone RECHAZAR';
            proposalMeta = `
              <div style="font-size: 0.75rem; color: ${color}; font-weight: bold; margin-top: 0.5rem;">
                📌 AM / GPV (${r.amProposalBy || 'Usuario'}) ${text}
              </div>
            `;
          }

          let revisionMeta = r.status !== 'pending' ? `
            <div style="font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); margin-top: 0.5rem; padding-top: 0.5rem;">
              Revisado por: ${r.reviewedBy} el ${r.reviewedAt}
            </div>
          ` : '';

          const card = document.createElement('div');
          card.className = 'contact-card';
          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: var(--text-primary); font-size:0.9rem;">${r.promotorName} (Zona: ${r.zone})</strong>
              <span class="badge badge-${statusClass}">${statusLabel}</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.25rem;">
              Fecha: ${r.date} | ${r.originalShift} ➔ ${r.requestedShift}
            </div>
            <div style="font-size:0.8rem; margin-top:0.25rem; font-style:italic;">
              Motivo: ${r.reason}
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">
              Creado: ${r.createdAt}
            </div>
            ${proposalMeta}
            ${actions}
            ${revisionMeta}
          `;
          reqContainer.appendChild(card);
        });
      }
    }
  }

  // Render Audit logs
  renderAuditLogs('manager-audit-timeline');
}

function renderManagerPromoterDetails(promoterId) {
  document.getElementById('manager-detail-placeholder').classList.add('hidden');
  const detailsContent = document.getElementById('manager-detail-content');
  detailsContent.classList.remove('hidden');

  const users = db.get('users', []);
  const schedules = db.get('schedules', []);
  
  const promoter = users.find(u => u.id === promoterId);
  const promoterSchedules = schedules.filter(s => s.promotorId === promoterId);

  document.getElementById('manager-detail-name').innerText = promoter.name;
  document.getElementById('manager-detail-role').innerText = promoter.role.toUpperCase();
  document.getElementById('manager-detail-email').innerText = promoter.email;
  document.getElementById('manager-detail-zone').innerText = promoter.region || promoter.zone || 'N/A';

  let planned = 0;
  promoterSchedules.forEach(s => {
    if (s.status === 'published' || s.status === 'conformed') {
      planned += calculateShiftHours(s.shift);
    }
  });
  const contract = promoter.contract_hours || 0;
  const balance = planned - contract;

  document.getElementById('manager-detail-contract-hours').innerText = contract > 0 ? `\${contract}h` : '-';
  document.getElementById('manager-detail-planned-hours').innerText = `\${planned}h`;
  const balEl = document.getElementById('manager-detail-balance-hours');
  balEl.innerText = contract > 0 ? `\${balance >= 0 ? '+' : ''}\${balance}h` : '-';
  if (contract > 0) {
    balEl.style.color = balance === 0 ? 'var(--success)' : (balance > 0 ? 'var(--warning)' : 'var(--danger)');
  } else {
    balEl.style.color = 'var(--text-secondary)';
  }

  const tbody = document.getElementById('manager-detail-schedules-tbody');
  tbody.innerHTML = '';

  if (promoterSchedules.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Sin horarios registrados.</td></tr>`;
  } else {
    promoterSchedules.forEach(s => {
      let trClass = 'row-draft';
      let statusBadge = `<span class="badge badge-draft">Draft</span>`;
      if (s.status === 'published') {
        trClass = 'row-published';
        statusBadge = `<span class="badge badge-info">Publicado / Pendiente</span>`;
      } else if (s.status === 'conformed') {
        trClass = 'row-conformed';
        statusBadge = `<span class="badge badge-success">✓ Conforme</span>`;
      }

      const tr = document.createElement('tr');
      tr.className = trClass;
      tr.innerHTML = `
        <td>\${formatDate(s.date)}</td>
        <td>\${s.shift} (\${calculateShiftHours(s.shift)}h)</td>
        <td>\${s.location}</td>
        <td>\${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

window.proposeRequest = function(requestId, proposal) {
  const requests = db.get('requests', []);
  const reqIndex = requests.findIndex(r => r.id === requestId);
  if (reqIndex !== -1) {
    requests[reqIndex].amProposal = proposal;
    requests[reqIndex].amProposalBy = currentUser.name;
    db.set('requests', requests);
    
    logAction('PROPUESTA_CAMBIO', `\${currentUser.role.toUpperCase()} propuso \${proposal === 'approve' ? 'APROBAR' : 'RECHAZAR'} el cambio de \${requests[reqIndex].promotorName}`);
    showToast(`Propuesta enviada correctamente`);
    renderManagerDashboard();
  }
};

window.reviewRequest = function(requestId, newStatus) {
  const requests = db.get('requests', []);
  const schedules = db.get('schedules', []);

  const reqIndex = requests.findIndex(r => r.id === requestId);
  if (reqIndex !== -1) {
    const request = requests[reqIndex];
    const now = new Date();
    const formattedDate = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + ' ' + 
      String(now.getHours()).padStart(2, '0') + ':' + 
      String(now.getMinutes()).padStart(2, '0');

    request.status = newStatus;
    request.reviewedBy = currentUser.name;
    request.reviewedAt = formattedDate;

    if (newStatus === 'approved') {
      const schIndex = schedules.findIndex(s => s.promotorId === request.promotorId && s.date === request.date);
      if (schIndex !== -1) {
        schedules[schIndex].shift = request.requestedShift;
        schedules[schIndex].status = 'published';
        schedules[schIndex].conformedAt = null;
      }
    }

    db.set('requests', requests);
    db.set('schedules', schedules);

    logAction(newStatus === 'approved' ? 'APROBACION_CAMBIO' : 'RECHAZO_CAMBIO', 
      `Coordinadora \${newStatus === 'approved' ? 'aprobó' : 'rechazó'} cambio para \${request.promotorName} el \${request.date}`);

    showToast(`Solicitud \${newStatus === 'approved' ? 'aprobada' : 'rechazada'} correctamente`);
    renderManagerDashboard();
  }
};

window.openResetPasswordModal = function(fromScreen) {
  const users = db.get('users', []);
  const select = document.getElementById('reset-user-select');
  select.innerHTML = '';

  let allowedUsers = [];
  if (currentUser.role === 'am') {
    allowedUsers = users.filter(u => ['promotor', 'gpv'].includes(u.role) && String(u.manager?.am).toLowerCase() === String(currentUser.name).toLowerCase());
  } else if (currentUser.role === 'coordinadora') {
    allowedUsers = users.filter(u => ['promotor', 'gpv', 'am'].includes(u.role) && String(u.manager?.coordinadora).toLowerCase() === String(currentUser.name).toLowerCase());
  } else if (currentUser.role === 'administradora') {
    allowedUsers = users.filter(u => u.id !== currentUser.id); 
  }

  allowedUsers.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = `\${u.name} (\${u.role.toUpperCase()} - \${u.region || u.zone || 'Global'})`;
    select.appendChild(opt);
  });

  document.getElementById('reset-modal-new-pw').value = '';
  document.getElementById('reset-password-modal').classList.remove('hidden');
};

window.closeResetPasswordModal = function() {
  document.getElementById('reset-password-modal').classList.add('hidden');
};

window.submitResetPassword = function(e) {
  e.preventDefault();
  const userId = document.getElementById('reset-user-select').value;
  const newPassword = document.getElementById('reset-modal-new-pw').value.trim();

  if (!newPassword) {
    showToast('Por favor, ingresa una contraseña válida.', 'danger');
    return;
  }

  const users = db.get('users', []);
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].password = newPassword;
    db.set('users', users);

    logAction('RESET_CONTRASEÑA', `Se reseteó la contraseña de \${users[index].name}`);
    showToast(`Contraseña de \${users[index].name} cambiada con éxito.`);
    closeResetPasswordModal();
  }
};

window.openCreateUserModal = function() {
  document.getElementById('create-username').value = '';
  document.getElementById('create-name').value = '';
  document.getElementById('create-email').value = '';
  document.getElementById('create-password').value = 'password123';
  
  // Update allowed roles based on current user
  const roleSelect = document.getElementById('create-user-role');
  if (roleSelect) {
    roleSelect.innerHTML = '';
    if (currentUser.role === 'am') {
      roleSelect.innerHTML = `<option value="promotor">Promotor</option><option value="gpv">GPV</option>`;
    } else if (currentUser.role === 'coordinadora') {
      roleSelect.innerHTML = `<option value="promotor">Promotor</option><option value="gpv">GPV</option><option value="am">Area Manager (AM)</option>`;
    } else if (currentUser.role === 'administradora') {
      roleSelect.innerHTML = `<option value="promotor">Promotor</option><option value="gpv">GPV</option><option value="am">Area Manager (AM)</option><option value="coordinadora">Coordinadora</option>`;
    }
    updateCreateUserFields(); // Trigger to update UI
  }
  
  document.getElementById('create-user-modal').classList.remove('hidden');
};

window.closeCreateUserModal = function() {
  document.getElementById('create-user-modal').classList.add('hidden');
};

window.submitCreateUser = function(e) {
  e.preventDefault();
  const username = document.getElementById('create-username').value.trim();
  const name = document.getElementById('create-name').value.trim();
  const email = document.getElementById('create-email').value.trim();
  const password = document.getElementById('create-password').value.trim();
  const role = document.getElementById('create-user-role').value;
  const region = document.getElementById('create-zone').value; // Using zone input for region
  const contract_hours = parseInt(document.getElementById('create-contract-hours').value || 40);

  if (!username || !name || !email || !password) {
    showToast('Por favor, completa todos los campos.', 'danger');
    return;
  }

  const users = db.get('users', []);
  if (users.some(u => u.username === username)) {
    showToast('El nombre de usuario ya existe.', 'danger');
    return;
  }

  const newId = role + '_' + Date.now();
  
  // Infer managers based on current user creating them
  let am = '';
  let coordinadora = '';
  
  if (currentUser.role === 'am') {
    am = currentUser.name;
    coordinadora = currentUser.manager?.coordinadora || '';
  } else if (currentUser.role === 'coordinadora') {
    coordinadora = currentUser.name;
    // AM will be empty, they will have to assign it later or let it be empty if they directly report to coord
  }

  const newUser = {
    id: newId,
    username,
    password,
    name,
    role,
    region: region,
    zone: region,
    email,
    contract_hours: role === 'promotor' ? contract_hours : null,
    manager: {
      gpv: '',
      am: am,
      coordinadora: coordinadora,
      trainer: ''
    }
  };

  users.push(newUser);
  db.set('users', users);

  logAction('CREACION_USUARIO', `Se creó el usuario \${name} con rol \${role.toUpperCase()}`);
  showToast(`Usuario \${name} (\${role.toUpperCase()}) creado con éxito`);
  closeCreateUserModal();
  renderManagerDashboard();
};

// Render Audit Logs UI helper
function renderAuditLogs(elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;

  const logs = db.get('audit_logs', []);
  container.innerHTML = '';

  if (logs.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1rem;">No hay registros de auditoría.</div>`;
  } else {
    logs.forEach(log => {
      const item = document.createElement('div');
      item.className = 'audit-item';
      item.innerHTML = `
        <div style="font-weight:600; color:var(--text-primary); display:flex; justify-content:space-between;">
          <span>${log.action.replace('_', ' ')}</span>
          <span style="font-size:0.75rem; color:var(--primary); font-family:'Outfit'; text-transform:uppercase;">${log.role}</span>
        </div>
        <div style="color:var(--text-secondary); margin: 0.15rem 0;">${log.details}</div>
        <div class="audit-meta">
          <span>Usuario: ${log.user}</span>
          <span>${log.timestamp}</span>
        </div>
      `;
      container.appendChild(item);
    });
  }
}


// ----------------------------------------------------
// BOOTSTRAP INITIALIZATION
// ----------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  const reqForm = document.getElementById('request-change-form');
  if (reqForm) {
    reqForm.addEventListener('submit', submitChangeRequest);
  }

  const resetForm = document.getElementById('reset-password-form');
  if (resetForm) {
    resetForm.addEventListener('submit', submitResetPassword);
  }

  const createUserForm = document.getElementById('create-user-form');
  if (createUserForm) {
    createUserForm.addEventListener('submit', submitCreateUser);
  }

  if (currentUser) {
    routeToDashboard(currentUser);
  } else {
    showScreen('screen-login');
  }
});
