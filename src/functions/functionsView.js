import { getFunctions, createFunction, updateFunction, deleteFunction } from './functionsAPI.js'
import { renderNavbar } from '../utils/navbar.js'

// Vista de cartelera para el usuario (solo lectura)
export async function renderBillboard() {
  renderNavbar()
  const app = document.getElementById('app')
  app.innerHTML = `<p class="text-gray-400">Cargando cartelera...</p>`

  const functions = await getFunctions()
  const active = functions.filter(f => f.status === 'active')

  app.innerHTML = `
    <h2 class="text-2xl font-bold text-yellow-400 mb-6">🎬 Cartelera disponible</h2>
    ${active.length === 0
      ? '<p class="text-gray-400">No hay funciones disponibles.</p>'
      : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${active.map(f => functionCard(f)).join('')}
        </div>`
    }
  `

  // Asignar eventos a los botones de reservar
  document.querySelectorAll('.btn-reserve').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id
      window.location.hash = `#/reserve/${id}`
    })
  })
}

// Tarjeta de función para la cartelera
function functionCard(f) {
  return `
    <div class="bg-gray-800 rounded-xl p-5 shadow flex flex-col gap-2">
      <h3 class="text-lg font-bold text-white">${f.movie}</h3>
      <p class="text-gray-400 text-sm">📍 ${f.room}</p>
      <p class="text-gray-400 text-sm">📅 ${f.date} — ⏰ ${f.time}</p>
      <p class="text-sm ${f.availableSeats === 0 ? 'text-red-400' : 'text-green-400'}">
        💺 ${f.availableSeats} cupos disponibles
      </p>
      <button
        class="btn-reserve mt-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-1 rounded transition disabled:opacity-50"
        data-id="${f.id}"
        ${f.availableSeats === 0 ? 'disabled' : ''}
      >
        Reservar
      </button>
    </div>
  `
}

// Vista de gestión de funciones para admin
export async function renderAdminFunctions() {
  renderNavbar()
  const app = document.getElementById('app')
  app.innerHTML = `<p class="text-gray-400">Cargando funciones...</p>`

  const functions = await getFunctions()

  app.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-yellow-400">⚙️ Gestión de Funciones</h2>
      <button id="btn-new-function" class="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded transition">
        + Nueva función
      </button>
    </div>

    <div id="function-form-container"></div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm bg-gray-800 rounded-xl overflow-hidden">
        <thead class="bg-gray-700 text-gray-300">
          <tr>
            <th class="px-4 py-3 text-left">Película</th>
            <th class="px-4 py-3 text-left">Sala</th>
            <th class="px-4 py-3 text-left">Fecha</th>
            <th class="px-4 py-3 text-left">Hora</th>
            <th class="px-4 py-3 text-left">Cupos</th>
            <th class="px-4 py-3 text-left">Estado</th>
            <th class="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody id="functions-table-body">
          ${functions.map(f => functionRow(f)).join('')}
        </tbody>
      </table>
    </div>
  `

  document.getElementById('btn-new-function').addEventListener('click', () => {
    showFunctionForm(null)
  })

  assignTableEvents()
}

// Fila de la tabla de funciones
function functionRow(f) {
  return `
    <tr class="border-t border-gray-700 hover:bg-gray-750" data-id="${f.id}">
      <td class="px-4 py-3">${f.movie}</td>
      <td class="px-4 py-3">${f.room}</td>
      <td class="px-4 py-3">${f.date}</td>
      <td class="px-4 py-3">${f.time}</td>
      <td class="px-4 py-3">${f.availableSeats} / ${f.totalCapacity}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded text-xs font-bold ${f.status === 'active' ? 'bg-green-700 text-green-200' : 'bg-red-700 text-red-200'}">
          ${f.status === 'active' ? 'Activa' : 'Cancelada'}
        </span>
      </td>
      <td class="px-4 py-3 flex gap-2">
        <button class="btn-edit-function text-blue-400 hover:text-blue-300 text-xs" data-id="${f.id}">Editar</button>
        <button class="btn-delete-function text-red-400 hover:text-red-300 text-xs" data-id="${f.id}">Eliminar</button>
      </td>
    </tr>
  `
}

// Muestra el formulario para crear o editar
function showFunctionForm(existingFunction) {
  const container = document.getElementById('function-form-container')
  const isEdit = existingFunction !== null

  container.innerHTML = `
    <div class="bg-gray-800 rounded-xl p-6 mb-6 border border-yellow-400">
      <h3 class="text-lg font-bold text-yellow-400 mb-4">${isEdit ? 'Editar función' : 'Nueva función'}</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-400">Película</label>
          <input id="f-movie" type="text" value="${isEdit ? existingFunction.movie : ''}"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 focus:outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label class="text-sm text-gray-400">Sala</label>
          <input id="f-room" type="text" value="${isEdit ? existingFunction.room : ''}"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 focus:outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label class="text-sm text-gray-400">Fecha</label>
          <input id="f-date" type="date" value="${isEdit ? existingFunction.date : ''}"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 focus:outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label class="text-sm text-gray-400">Hora</label>
          <input id="f-time" type="time" value="${isEdit ? existingFunction.time : ''}"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 focus:outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label class="text-sm text-gray-400">Capacidad total</label>
          <input id="f-capacity" type="number" min="1" value="${isEdit ? existingFunction.totalCapacity : ''}"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 focus:outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label class="text-sm text-gray-400">Estado</label>
          <select id="f-status" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 focus:outline-none focus:border-yellow-400">
            <option value="active" ${isEdit && existingFunction.status === 'active' ? 'selected' : ''}>Activa</option>
            <option value="cancelled" ${isEdit && existingFunction.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
          </select>
        </div>
      </div>
      <div id="form-error" class="hidden text-red-400 text-sm mt-3"></div>
      <div class="flex gap-3 mt-4">
        <button id="btn-save-function" data-id="${isEdit ? existingFunction.id : ''}"
          class="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2 rounded transition">
          ${isEdit ? 'Guardar cambios' : 'Crear función'}
        </button>
        <button id="btn-cancel-form" class="bg-gray-600 hover:bg-gray-500 px-5 py-2 rounded transition">
          Cancelar
        </button>
      </div>
    </div>
  `

  document.getElementById('btn-save-function').addEventListener('click', () => handleSaveFunction(isEdit, existingFunction))
  document.getElementById('btn-cancel-form').addEventListener('click', () => { container.innerHTML = '' })
}

async function handleSaveFunction(isEdit, existingFunction) {
  const movie = document.getElementById('f-movie').value.trim()
  const room = document.getElementById('f-room').value.trim()
  const date = document.getElementById('f-date').value
  const time = document.getElementById('f-time').value
  const capacity = parseInt(document.getElementById('f-capacity').value)
  const status = document.getElementById('f-status').value
  const errorDiv = document.getElementById('form-error')

  if (!movie || !room || !date || !time || !capacity) {
    errorDiv.textContent = 'Todos los campos son obligatorios'
    errorDiv.classList.remove('hidden')
    return
  }

  const data = {
    movie, room, date, time,
    totalCapacity: capacity,
    // Si es nuevo, cupos disponibles = capacidad total
    // Si es edición, mantenemos los cupos actuales
    availableSeats: isEdit ? existingFunction.availableSeats : capacity,
    status
  }

  try {
    if (isEdit) {
      await updateFunction(existingFunction.id, { ...existingFunction, ...data })
    } else {
      await createFunction(data)
    }
    // Recarga la vista
    renderAdminFunctions()
  } catch (err) {
    errorDiv.textContent = 'Error al guardar. Verifica que json-server esté corriendo.'
    errorDiv.classList.remove('hidden')
  }
}

function assignTableEvents() {
  document.querySelectorAll('.btn-edit-function').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { getFunctionById } = await import('./functionsAPI.js')
      const fn = await getFunctionById(btn.dataset.id)
      showFunctionForm(fn)
    })
  })

  document.querySelectorAll('.btn-delete-function').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar esta función?')) return
      await deleteFunction(btn.dataset.id)
      renderAdminFunctions()
    })
  })
}
