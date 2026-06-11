import { login } from './auth.js'
import { navigateTo } from '../router.js'

export function renderLogin() {
  const app = document.getElementById('app')
  const navbar = document.getElementById('navbar')

  // Ocultamos navbar en login
  navbar.classList.add('hidden')

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center">
      <div class="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 class="text-3xl font-bold text-yellow-400 text-center mb-2">🎬 CinemaApp</h1>
        <p class="text-gray-400 text-center mb-6">Inicia sesión para continuar</p>

        <div id="login-error" class="hidden bg-red-500 text-white text-sm px-4 py-2 rounded mb-4"></div>

        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Correo electrónico</label>
            <input
              id="input-email"
              type="email"
              placeholder="correo@ejemplo.com"
              class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Contraseña</label>
            <input
              id="input-password"
              type="password"
              placeholder="••••••••"
              class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <button
            id="btn-login"
            class="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 rounded transition mt-2"
          >
            Ingresar
          </button>
        </div>

        <div class="mt-6 text-xs text-gray-500 text-center">
          <p>Admin: admin@cinema.com / admin123</p>
          <p>User: juan@user.com / user123</p>
        </div>
      </div>
    </div>
  `

  document.getElementById('btn-login').addEventListener('click', handleLogin)

  // También permite hacer login con Enter
  document.getElementById('input-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin()
  })
}

async function handleLogin() {
  const email = document.getElementById('input-email').value.trim()
  const password = document.getElementById('input-password').value.trim()
  const errorDiv = document.getElementById('login-error')

  // Validación básica
  if (!email || !password) {
    errorDiv.textContent = 'Por favor completa todos los campos'
    errorDiv.classList.remove('hidden')
    return
  }

  try {
    const user = await login(email, password)
    // Redirige según el rol
    if (user.role === 'admin') {
      navigateTo('#/admin/functions')
    } else {
      navigateTo('#/billboard')
    }
  } catch (err) {
    errorDiv.textContent = err.message
    errorDiv.classList.remove('hidden')
  }
}
