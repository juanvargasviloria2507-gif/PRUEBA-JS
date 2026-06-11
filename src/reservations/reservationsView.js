import { getAllReservations, getUserReservations, updateReservation, cancelReservation, deleteReservation, createReservation } from './reservationsAPI.js'
import { getFunctionById, updateAvailableSeats, getFunctions } from '../functions/functionsAPI.js'
import { getSession, isAdmin } from '../auth/auth.js'
import { renderNavbar } from '../utils/navbar.js'
import { navigateTo } from '../router.js'

// Vista de reservas del usuario actual
export async function renderMyReservations() {
  renderNavbar()
  const app = document.getElementById('app')
  app.innerHTML = `<p class="text-gray-400">Cargando tus reservas...</p>`

  const user = getSession()
  const reservations = await getUserReservations(user.id)

  app.innerHTML = `
    <h2 class="text-2xl font-bold text-yellow-400 mb-6">📋 Mis Reservas</h2>
    <div id="edit-form-container"></div>
    ${reservations.length === 0
      ? '<p class="text-gray-400">No tienes reservas aún. Ve a la <a href="#/billboard" class="text-yellow-400 underline">cartelera</a> para reservar.</p>'
      : `<div class="flex flex-col gap-4">${reservations.map(r => reservationCard(r)).join('')}</div>`
    }
  `

  assignUserReservationEvents(reservations)
}

// Tarjeta de reserva para el usuario
function reservationCard(r) {
  const isCancelled = r.status === 'cancelled'
  const isConfirmed = r.status === 'confirmed'

  return `
    <div class="bg-gray-800 rounded-xl p-5 shadow border-l-4 ${isCancelled ? 'border-red-500' : isConfirmed ? 'border-green-500' : 'border-yellow-400'}">
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold text-white text-lg">${r.movieName}</p>
          <p class="text-gray-400 text-sm">📅 ${r.functionDate} — ⏰ ${r.functionTime}</p>
          <p class="text-gray-400 text-sm">📍 ${r.room}</p>
          <p class="text-gray-400 text-sm mt-1">🎟 ${r.tickets} entrada(s)</p>
          <p class="text-gray-400 text-sm">📆 Reservado el: ${r.reservationDate}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold ${
          isCancelled ? 'bg-red-700 text-red-200' :
          isConfirmed ? 'bg-green-700 text-green-200' :
          'bg-yellow-700 text-yellow-200'
        }">
          ${r.status === 'pending' ? 'Pendiente' : r.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
        </span>
      </div>
      ${!isCancelled ? `
        <div class="flex gap-3 mt-4">
          <button class="btn-edit-reservation text-blue-400 hover:text-blue-300 text-sm" data-id="${r.id}">✏️ Editar</button>
          <button class="btn-cancel-reservation text-red-400 hover:text-red-300 text-sm" data-id="${r.id}">❌ Cancelar</button>
        </div>
      ` : '<p class="text-red-400 text-xs mt-3">Esta reserva fue cancelada y no puede reactivarse.</p>'}
    </div>
  `
}

function assignUserReservationEvents(reservations) {
  document.querySelectorAll('.btn-cancel-reservation').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Cancelar esta reserva?')) return
      const reservation = reservations.find(r => r.id === btn.dataset.id)
      // Devuelve los cupos a la función
      const fn = await getFunctionById(reservation.functionId)
      await updateAvailableSeats(fn.id, fn.availableSeats + reservation.tickets)
      await cancelReservation(reservation.id, reservation)
      renderMyReservations()
    })
  })

  document.querySelectorAll('.btn-edit-reservation').forEach(btn => {
    btn.addEventListener('click', () => {
      const reservation = reservations.find(r => r.id === btn.dataset.id)
      showEditReservationForm(reservation)
    })
  })
}

function showEditReservationForm(reservation) {
  const container = document.getElementById('edit-form-container')
  container.innerHTML = `
    <div class="bg-gray-800 border border-yellow-400 rounded-xl p-5 mb-5">
      <h3 class="text-yellow-400 font-bold mb-3">Editar reserva: ${reservation.movieName}</h3>
      <label class="text-sm text-gray-400">Cantidad de entradas</label>
      <input id="edit-tickets" type="number" min="1" value="${reservation.tickets}"
        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 mb-3 focus:outline-none focus:border-yellow-400" />
      <div id="edit-error" class="hidden text-red-400 text-sm mb-2"></div>
      <div class="flex gap-3">
        <button id="btn-save-edit" class="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded transition">Guardar</button>
        <button id="btn-cancel-edit" class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition">Cancelar</button>
      </div>
    </div>
  `

  document.getElementById('btn-cancel-edit').addEventListener('click', () => { container.innerHTML = '' })
  document.getElementById('btn-save-edit').addEventListener('click', async () => {
    const newTickets = parseInt(document.getElementById('edit-tickets').value)
    const errorDiv = document.getElementById('edit-error')

    if (!newTickets || newTickets < 1) {
      errorDiv.textContent = 'Debe ingresar al menos 1 entrada'
      errorDiv.classList.remove('hidden')
      return
    }

    const fn = await getFunctionById(reservation.functionId)
    // Cupos devueltos de la reserva anterior + cupos actuales
    const seatsAfterRevert = fn.availableSeats + reservation.tickets
    if (newTickets > seatsAfterRevert) {
      errorDiv.textContent = `Solo hay ${seatsAfterRevert} cupos disponibles`
      errorDiv.classList.remove('hidden')
      return
    }

    await updateReservation(reservation.id, { ...reservation, tickets: newTickets })
    await updateAvailableSeats(fn.id, seatsAfterRevert - newTickets)
    renderMyReservations()
  })
}

// Vista de reservar para una función específica
export async function renderReserveForm(functionId) {
  renderNavbar()
  const app = document.getElementById('app')

  const fn = await getFunctionById(functionId)
  if (!fn || fn.status === 'cancelled') {
    app.innerHTML = `<p class="text-red-400">Esta función no está disponible.</p>`
    return
  }

  const user = getSession()

  app.innerHTML = `
    <div class="max-w-lg mx-auto bg-gray-800 rounded-xl p-6 shadow">
      <h2 class="text-xl font-bold text-yellow-400 mb-1">🎟 Reservar entradas</h2>
      <p class="text-white font-semibold text-lg mb-1">${fn.movie}</p>
      <p class="text-gray-400 text-sm mb-1">📍 ${fn.room} — 📅 ${fn.date} ⏰ ${fn.time}</p>
      <p class="text-green-400 text-sm mb-4">💺 ${fn.availableSeats} cupos disponibles</p>

      <label class="text-sm text-gray-400">Cantidad de entradas</label>
      <input id="reserve-tickets" type="number" min="1" max="${fn.availableSeats}" placeholder="Ej: 2"
        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 mb-3 focus:outline-none focus:border-yellow-400" />

      <div id="reserve-error" class="hidden text-red-400 text-sm mb-2"></div>

      <div class="flex gap-3">
        <button id="btn-confirm-reserve" class="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2 rounded transition">
          Confirmar reserva
        </button>
        <a href="#/billboard" class="bg-gray-600 hover:bg-gray-500 px-5 py-2 rounded transition">Volver</a>
      </div>
    </div>
  `

  document.getElementById('btn-confirm-reserve').addEventListener('click', async () => {
    const tickets = parseInt(document.getElementById('reserve-tickets').value)
    const errorDiv = document.getElementById('reserve-error')

    if (!tickets || tickets < 1) {
      errorDiv.textContent = 'Ingresa una cantidad válida'
      errorDiv.classList.remove('hidden')
      return
    }
    if (tickets > fn.availableSeats) {
      errorDiv.textContent = `Solo hay ${fn.availableSeats} cupos disponibles`
      errorDiv.classList.remove('hidden')
      return
    }

    const today = new Date().toISOString().split('T')[0]

    const newReservation = {
      userId: user.id,
      userName: user.name,
      functionId: fn.id,
      movieName: fn.movie,
      functionDate: fn.date,
      functionTime: fn.time,
      room: fn.room,
      tickets,
      reservationDate: today,
      status: 'pending'
    }

    await createReservation(newReservation)
    await updateAvailableSeats(fn.id, fn.availableSeats - tickets)
    navigateTo('#/my-reservations')
  })
}

// Vista de todas las reservas para admin
export async function renderAdminReservations() {
  renderNavbar()
  const app = document.getElementById('app')
  app.innerHTML = `<p class="text-gray-400">Cargando reservas...</p>`

  const reservations = await getAllReservations()

  app.innerHTML = `
    <h2 class="text-2xl font-bold text-yellow-400 mb-6">📋 Todas las Reservas</h2>
    ${reservations.length === 0
      ? '<p class="text-gray-400">No hay reservas registradas.</p>'
      : `<div class="overflow-x-auto">
          <table class="w-full text-sm bg-gray-800 rounded-xl overflow-hidden">
            <thead class="bg-gray-700 text-gray-300">
              <tr>
                <th class="px-4 py-3 text-left">Usuario</th>
                <th class="px-4 py-3 text-left">Película</th>
                <th class="px-4 py-3 text-left">Fecha función</th>
                <th class="px-4 py-3 text-left">Entradas</th>
                <th class="px-4 py-3 text-left">Fecha reserva</th>
                <th class="px-4 py-3 text-left">Estado</th>
                <th class="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${reservations.map(r => adminReservationRow(r)).join('')}
            </tbody>
          </table>
        </div>`
    }
  `

  assignAdminReservationEvents(reservations)
}

function adminReservationRow(r) {
  return `
    <tr class="border-t border-gray-700" data-id="${r.id}">
      <td class="px-4 py-3">${r.userName}</td>
      <td class="px-4 py-3">${r.movieName}</td>
      <td class="px-4 py-3">${r.functionDate} ${r.functionTime}</td>
      <td class="px-4 py-3">${r.tickets}</td>
      <td class="px-4 py-3">${r.reservationDate}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded text-xs font-bold ${
          r.status === 'cancelled' ? 'bg-red-700 text-red-200' :
          r.status === 'confirmed' ? 'bg-green-700 text-green-200' :
          'bg-yellow-700 text-yellow-200'
        }">
          ${r.status === 'pending' ? 'Pendiente' : r.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
        </span>
      </td>
      <td class="px-4 py-3 flex gap-2 flex-wrap">
        ${r.status !== 'cancelled' ? `
          <button class="btn-admin-confirm text-green-400 hover:text-green-300 text-xs" data-id="${r.id}">✅ Confirmar</button>
          <button class="btn-admin-cancel text-red-400 hover:text-red-300 text-xs" data-id="${r.id}">❌ Cancelar</button>
        ` : ''}
        <button class="btn-admin-delete text-gray-400 hover:text-white text-xs" data-id="${r.id}">🗑 Eliminar</button>
      </td>
    </tr>
  `
}

function assignAdminReservationEvents(reservations) {
  document.querySelectorAll('.btn-admin-confirm').forEach(btn => {
    btn.addEventListener('click', async () => {
      const r = reservations.find(x => x.id === btn.dataset.id)
      await updateReservation(r.id, { ...r, status: 'confirmed' })
      renderAdminReservations()
    })
  })

  document.querySelectorAll('.btn-admin-cancel').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Cancelar esta reserva?')) return
      const r = reservations.find(x => x.id === btn.dataset.id)
      const fn = await getFunctionById(r.functionId)
      await updateAvailableSeats(fn.id, fn.availableSeats + r.tickets)
      await cancelReservation(r.id, r)
      renderAdminReservations()
    })
  })

  document.querySelectorAll('.btn-admin-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar permanentemente esta reserva?')) return
      await deleteReservation(btn.dataset.id)
      renderAdminReservations()
    })
  })
}
