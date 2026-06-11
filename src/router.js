import { requireAuth, requireAdmin } from './utils/guards.js'
import { renderLogin } from './auth/loginView.js'
import { renderBillboard, renderAdminFunctions } from './functions/functionsView.js'
import { renderMyReservations, renderReserveForm, renderAdminReservations } from './reservations/reservationsView.js'

// Definición de rutas
const routes = {
  '#/login': () => renderLogin(),

  '#/billboard': () => {
    if (!requireAuth()) return
    renderBillboard()
  },

  '#/my-reservations': () => {
    if (!requireAuth()) return
    renderMyReservations()
  },

  // Ruta dinámica: #/reserve/1, #/reserve/2, etc.
  '#/reserve': (id) => {
    if (!requireAuth()) return
    renderReserveForm(id)
  },

  '#/admin/functions': () => {
    if (!requireAdmin()) return
    renderAdminFunctions()
  },

  '#/admin/reservations': () => {
    if (!requireAdmin()) return
    renderAdminReservations()
  }
}

export function navigateTo(hash) {
  window.location.hash = hash
}

export function initRouter() {
  function handleRoute() {
    const hash = window.location.hash || '#/login'

    // Rutas dinámicas con parámetro (ej: #/reserve/3)
    if (hash.startsWith('#/reserve/')) {
      const id = hash.split('/')[2]
      routes['#/reserve'](id)
      return
    }

    const handler = routes[hash]
    if (handler) {
      handler()
    } else {
      // Ruta no encontrada → redirige a login
      navigateTo('#/login')
    }
  }

  // Escucha cambios en el hash
  window.addEventListener('hashchange', handleRoute)
  // Ejecuta la ruta actual al cargar la página
  handleRoute()
}
