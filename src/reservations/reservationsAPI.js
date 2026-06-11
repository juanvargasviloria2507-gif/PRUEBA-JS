const API = 'http://localhost:3001'

// Obtiene todas las reservas
export async function getAllReservations() {
  const res = await fetch(`${API}/reservations`)
  return res.json()
}

// Obtiene reservas de un usuario específico
export async function getUserReservations(userId) {
  const res = await fetch(`${API}/reservations?userId=${userId}`)
  return res.json()
}

// Crea una nueva reserva
export async function createReservation(data) {
  const res = await fetch(`${API}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

// Actualiza una reserva (editar cantidad o estado)
export async function updateReservation(id, data) {
  const res = await fetch(`${API}/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

// Cancela una reserva (cambia estado a 'cancelled')
export async function cancelReservation(id, reservationData) {
  const res = await fetch(`${API}/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...reservationData, status: 'cancelled' })
  })
  return res.json()
}

// Elimina una reserva (solo admin)
export async function deleteReservation(id) {
  const res = await fetch(`${API}/reservations/${id}`, {
    method: 'DELETE'
  })
  return res.ok
}
