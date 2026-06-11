const API = 'http://localhost:3001'

// Obtiene todas las funciones
export async function getFunctions() {
  const res = await fetch(`${API}/functions`)
  return res.json()
}

// Obtiene una función por ID
export async function getFunctionById(id) {
  const res = await fetch(`${API}/functions/${id}`)
  return res.json()
}

// Crea una nueva función (solo admin)
export async function createFunction(data) {
  const res = await fetch(`${API}/functions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

// Edita una función existente (solo admin)
export async function updateFunction(id, data) {
  const res = await fetch(`${API}/functions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

// Elimina una función (solo admin)
export async function deleteFunction(id) {
  const res = await fetch(`${API}/functions/${id}`, {
    method: 'DELETE'
  })
  return res.ok
}

// Actualiza los cupos disponibles de una función
export async function updateAvailableSeats(id, newAvailableSeats) {
  const res = await fetch(`${API}/functions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availableSeats: newAvailableSeats })
  })
  return res.json()
}
