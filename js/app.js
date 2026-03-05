const users = [];
const tasks = [];

let sessionUser = null;
let failedLoginAttempts = 0;
let lockUntil = 0;

const authStatus = document.getElementById('auth-status');
const alertsEl = document.getElementById('alerts');
const taskList = document.getElementById('task-list');

const authForm = document.getElementById('auth-form');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const taskForm = document.getElementById('task-form');
const clearTaskBtn = document.getElementById('clear-task');

const searchInput = document.getElementById('search');
const statusFilter = document.getElementById('status-filter');

function now() {
  return Date.now();
}

function getAuthData() {
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value;
  return { email, password, role };
}

function fakeHash(password) {
  return `argon2$demo$${btoa(password)}`;
}

function setStatus(message, type = 'info') {
  authStatus.textContent = message;
  authStatus.style.border = `1px solid ${type === 'error' ? '#dc2626' : type === 'ok' ? '#16a34a' : '#334155'}`;
}

function register() {
  const { email, password, role } = getAuthData();

  if (!email || !password) {
    setStatus('Completa correo y contraseña para registrarte.', 'error');
    return;
  }

  if (users.some((u) => u.email === email)) {
    setStatus('Este correo ya está registrado.', 'error');
    return;
  }

  users.push({
    id: crypto.randomUUID(),
    email,
    passwordHash: fakeHash(password),
    role
  });

  setStatus(`Usuario ${email} registrado con hash seguro (simulado).`, 'ok');
  authForm.reset();
}

function login() {
  if (now() < lockUntil) {
    const seconds = Math.ceil((lockUntil - now()) / 1000);
    setStatus(`Bloqueo temporal activo. Intenta en ${seconds}s.`, 'error');
    return;
  }

  const { email, password } = getAuthData();
  const user = users.find((u) => u.email === email && u.passwordHash === fakeHash(password));

  if (!user) {
    failedLoginAttempts += 1;
    if (failedLoginAttempts >= 3) {
      lockUntil = now() + 30_000;
      failedLoginAttempts = 0;
      setStatus('Demasiados intentos fallidos. Bloqueo de 30 segundos.', 'error');
      return;
    }
    setStatus('Credenciales inválidas.', 'error');
    return;
  }

  failedLoginAttempts = 0;
  sessionUser = user;
  setStatus(`Sesión iniciada: ${user.email} (${user.role === 'admin' ? 'Administrador' : 'Usuario'})`, 'ok');
  renderTasks();
}

function logout() {
  sessionUser = null;
  setStatus('Sesión cerrada.', 'info');
  renderTasks();
}

function getTaskData() {
  return {
    id: document.getElementById('task-id').value,
    title: document.getElementById('task-title-input').value.trim(),
    description: document.getElementById('task-desc').value.trim(),
    dueDate: document.getElementById('task-due').value
  };
}

function saveTask(event) {
  event.preventDefault();
  if (!sessionUser) {
    setStatus('Debes iniciar sesión para gestionar tareas.', 'error');
    return;
  }

  const data = getTaskData();
  if (!data.title || !data.dueDate) {
    return;
  }

  if (data.id) {
    const task = tasks.find((t) => t.id === data.id);
    if (!task) return;
    if (sessionUser.role !== 'admin' && task.ownerId !== sessionUser.id) {
      setStatus('No tienes permiso para editar esta tarea.', 'error');
      return;
    }

    task.title = data.title;
    task.description = data.description;
    task.dueDate = data.dueDate;
  } else {
    tasks.push({
      id: crypto.randomUUID(),
      ownerId: sessionUser.id,
      ownerEmail: sessionUser.email,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      done: false
    });
  }

  taskForm.reset();
  document.getElementById('task-id').value = '';
  renderTasks();
}

function visibleTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  return tasks
    .filter((t) => {
      if (!sessionUser) return false;
      if (sessionUser.role === 'admin') return true;
      return t.ownerId === sessionUser.id;
    })
    .filter((t) => {
      if (status === 'pending') return !t.done;
      if (status === 'done') return t.done;
      return true;
    })
    .filter((t) => {
      if (!query) return true;
      return t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
    });
}

function renderTasks() {
  taskList.innerHTML = '';
  alertsEl.innerHTML = '';

  const list = visibleTasks();

  if (!sessionUser) {
    taskList.innerHTML = '<li class="task-item">Inicia sesión para ver tareas.</li>';
    return;
  }

  if (!list.length) {
    taskList.innerHTML = '<li class="task-item">No hay tareas para mostrar.</li>';
    return;
  }

  list.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.done ? 'done' : ''}`;

    const dueInfo = new Date(task.dueDate + 'T00:00:00');
    const hoursLeft = Math.floor((dueInfo - new Date()) / (1000 * 60 * 60));
    if (hoursLeft <= 48 && hoursLeft >= 0 && !task.done) {
      const alert = document.createElement('li');
      alert.textContent = `La tarea "${task.title}" vence pronto (${task.dueDate}).`;
      alertsEl.appendChild(alert);
    }

    li.innerHTML = `
      <strong>${task.title}</strong>
      <div>${task.description || 'Sin descripción.'}</div>
      <div class="task-meta">Due: ${task.dueDate} | Owner: ${task.ownerEmail}</div>
      <div class="task-actions">
        <button type="button" data-action="toggle" data-id="${task.id}">${task.done ? 'Reabrir' : 'Completar'}</button>
        <button type="button" data-action="edit" data-id="${task.id}" class="secondary">Editar</button>
        <button type="button" data-action="delete" data-id="${task.id}" class="danger">Eliminar</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

function handleTaskActions(event) {
  const button = event.target.closest('button[data-action]');
  if (!button || !sessionUser) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  if (sessionUser.role !== 'admin' && task.ownerId !== sessionUser.id) {
    setStatus('No tienes permiso sobre esta tarea.', 'error');
    return;
  }

  if (action === 'toggle') task.done = !task.done;

  if (action === 'delete') {
    const idx = tasks.findIndex((t) => t.id === id);
    tasks.splice(idx, 1);
  }

  if (action === 'edit') {
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title-input').value = task.title;
    document.getElementById('task-desc').value = task.description;
    document.getElementById('task-due').value = task.dueDate;
  }

  renderTasks();
}

registerBtn.addEventListener('click', register);
loginBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);
taskForm.addEventListener('submit', saveTask);
clearTaskBtn.addEventListener('click', () => {
  taskForm.reset();
  document.getElementById('task-id').value = '';
});
searchInput.addEventListener('input', renderTasks);
statusFilter.addEventListener('change', renderTasks);
taskList.addEventListener('click', handleTaskActions);

renderTasks();
