import { isLoggedIn, isAdmin } from '../auth/auth.js'
import { navigateTo } from '../router.js'

// Protege cualquier ruta: si no hay sesión, manda al login
export function requireAuth() {
  if (!isLoggedIn()) {
    navigateTo('#/login')
    return false
  }
  return true
}

// Protege rutas solo para admin
export function requireAdmin() {
  if (!isLoggedIn()) {
    navigateTo('#/login')
    return false
  }
  if (!isAdmin()) {
    navigateTo('#/billboard')
    return false
  }
  return true
}
