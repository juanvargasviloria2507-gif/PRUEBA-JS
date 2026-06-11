const API = 'http://localhost:3001'

// Guarda el usuario en localStorage
export function saveSession(user) {
  localStorage.setItem('currentUser', JSON.stringify(user))
}

// Obtiene el usuario guardado
export function getSession() {
  const data = localStorage.getItem('currentUser')
  return data ? JSON.parse(data) : null
}

// Elimina la sesión
export function clearSession() {
  localStorage.removeItem('currentUser')
}

// Verifica si hay sesión activa
export function isLoggedIn() {
  return getSession() !== null
}

// Verifica si el usuario es admin
export function isAdmin() {
  const user = getSession()
  return user?.role === 'admin'
}

// Hace login: busca el usuario en json-server y guarda sesión
export async function login(email, password) {
  const res = await fetch(`${API}/users?email=${email}&password=${password}`)
  const users = await res.json()

  if (users.length === 0) {
    throw new Error('Credenciales incorrectas')
  }

  const user = users[0]
  // No guardamos la contraseña en sesión por buenas prácticas
  const { password: _, ...safeUser } = user
  saveSession(safeUser)
  return safeUser
}
