import { getSession, isAdmin, clearSession } from '../auth/auth.js'
import { navigateTo } from '../router.js'

export function renderNavbar() {
  const navbar = document.getElementById('navbar')
  const user = getSession()

  if (!user) {
    navbar.classList.add('hidden')
    return
  }

  navbar.classList.remove('hidden')

  // Muestra el nombre del usuario
  document.getElementById('nav-username').textContent = `👤 ${user.name}`

  // Muestra links de admin solo si corresponde
  const adminFunctionsLink = document.getElementById('nav-admin-functions')
  const adminReservationsLink = document.getElementById('nav-admin-reservations')

  if (isAdmin()) {
    adminFunctionsLink.classList.remove('hidden')
    adminReservationsLink.classList.remove('hidden')
  } else {
    adminFunctionsLink.classList.add('hidden')
    adminReservationsLink.classList.add('hidden')
  }

  // Logout
  const btnLogout = document.getElementById('btn-logout')
  // Clona el botón para remover listeners anteriores
  const newBtn = btnLogout.cloneNode(true)
  btnLogout.parentNode.replaceChild(newBtn, btnLogout)
  newBtn.addEventListener('click', () => {
    clearSession()
    navigateTo('#/login')
  })
}
