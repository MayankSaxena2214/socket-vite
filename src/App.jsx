import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Auth from './components/Auth'
import RoleSelector from './components/RoleSelector'
import Tickets from './components/Tickets'
import UserLogin from './components/UserLogin'

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const Dashboard = () => {
  const [user, setUser] = useState(getStoredUser())

  useEffect(() => {
    const handleStorage = () => setUser(getStoredUser())
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('tokenType')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Socket test app</p>
            <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">User</p>
            <p className="mt-3 text-2xl font-semibold">{user?.fullName || user?.name || user?.role || 'Demo User'}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Role</p>
            <p className="mt-3 text-xl font-medium text-cyan-300 capitalize">{user?.role || 'customer'}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Token status</p>
            <p className="mt-3 inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
              Active
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Authenticated</h2>
          <p className="mt-3 text-slate-300">
            You are now logged in and can use the protected APIs with the bearer token saved in localStorage.
          </p>
        </div>
      </div>
    </div>
  )
}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken')
  return token ? children : <Navigate to="/" replace />
}

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<RoleSelector />} />
        <Route path="/customer-login" element={<Auth />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
