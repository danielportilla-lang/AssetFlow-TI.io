let equiposCache = [];

// Cargar lista de equipos desde el Servidor Node.js
async function cargar() {
  try {
    const res = await fetch('/api/equipos');
    equiposCache = await res.json();
    renderizarTabla(equiposCache);
    actualizarKPIs(equiposCache);
  } catch (error) {
    console.error('Error al cargar equipos:', error);
  }
}

// Dibujar la tabla dinámicamente
function renderizarTabla(equipos) {
  const tabla = document.getElementById('tabla');
  
  if (equipos.length === 0) {
    tabla.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 2rem;">No hay equipos registrados.</td></tr>`;
    return;
  }

  tabla.innerHTML = equipos.map(e => `
    <tr>
      <td style="font-weight: 600;">${e.nombre}</td>
      <td><span class="badge ${e.estado}">${e.estado}</span></td>
      <td>${e.empleado || '<span style="color:var(--text-muted);">—</span>'}</td>
      <td>${e.fecha_limite ? new Date(e.fecha_limite).toLocaleDateString() : '<span style="color:var(--text-muted);">—</span>'}</td>
      <td>
        ${e.estado === 'disponible'
          ? `<button onclick="abrirModal(${e.id})">Prestar</button>`
          : `<button class="btn-return" onclick="devolver(${e.id})">Devolver</button>`}
      </td>
    </tr>
  `).join('');
}

// Actualizar contadores superiores (KPIs)
function actualizarKPIs(equipos) {
  const total = equipos.length;
  const prestados = equipos.filter(e => e.estado === 'prestado').length;
  const disponibles = total - prestados;

  document.getElementById('kpiTotal').innerText = total;
  document.getElementById('kpiDisponibles').innerText = disponibles;
  document.getElementById('kpiPrestados').innerText = prestados;
}

// Filtro/Buscador en tiempo real
function filtrarTabla() {
  const busqueda = document.getElementById('buscador').value.toLowerCase();
  const filtrados = equiposCache.filter(e => 
    e.nombre.toLowerCase().includes(busqueda) || 
    (e.empleado && e.empleado.toLowerCase().includes(busqueda))
  );
  renderizarTabla(filtrados);
}

// Modal Interactivo para Prestar
function abrirModal(id) {
  document.getElementById('modalEquipoId').value = id;
  document.getElementById('modalEmpleado').value = '';
  document.getElementById('modalFechaLimite').value = '';
  document.getElementById('modalPrestar').classList.add('active');
}

function cerrarModal() {
  document.getElementById('modalPrestar').classList.remove('active');
}

async function confirmarPrestamo() {
  const id = document.getElementById('modalEquipoId').value;
  const empleado = document.getElementById('modalEmpleado').value.trim();
  const fecha_limite = document.getElementById('modalFechaLimite').value;

  if (!empleado || !fecha_limite) {
    alert('Por favor complete todos los campos.');
    return;
  }

  await fetch(`/api/equipos/${id}/prestar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ empleado, fecha_limite })
  });

  cerrarModal();
  cargar();
}

// Devolver un equipo
async function devolver(id) {
  await fetch(`/api/equipos/${id}/devolver`, { method: 'POST' });
  cargar();
}

// Agregar nuevo equipo
document.getElementById('formEquipo').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombreInput = document.getElementById('nombre');
  const nombre = nombreInput.value.trim();

  if (!nombre) return;

  await fetch('/api/equipos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre })
  });

  nombreInput.value = '';
  cargar();
});

// Cargar datos al abrir la página
cargar();