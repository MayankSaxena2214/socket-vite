import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

const UserLogin = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    role: 'admin',
    userId: '',
    name: '',
    accessToken: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.accessToken.trim()) {
      toast.error('Please paste your access token.')
      return
    }

    if (!form.userId.trim()) {
      toast.error('Please enter a user ID.')
      return
    }

    if (!form.name.trim()) {
      toast.error('Please enter your name.')
      return
    }

    setLoading(true)

    try {
      localStorage.setItem('accessToken', form.accessToken.trim())
      localStorage.setItem('tokenType', 'Bearer')
      localStorage.setItem('userRole', form.role)
      localStorage.setItem('userId', form.userId.trim())
      localStorage.setItem('userName', form.name.trim())
      localStorage.setItem('user', JSON.stringify({
        id: form.userId.trim(),
        name: form.name.trim(),
        role: form.role,
      }))

      window.dispatchEvent(new Event('storage'))
      toast.success('Token saved successfully.')
      navigate('/tickets')
    } catch (error) {
      toast.error('Unable to save the token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-7 shadow-2xl shadow-violet-950/30">
        <div className="mb-7 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-violet-400">Staff auth</p>
          <h1 className="mt-3 text-3xl font-bold">Token Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-700/50"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="super-admin">Super Admin</option>
              <option value="support-agent">Support Agent</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">User ID (UUID)</label>
            <input
              type="text"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              placeholder="Enter user UUID"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-700/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-700/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Access token</label>
            <textarea
              name="accessToken"
              value={form.accessToken}
              onChange={handleChange}
              rows={5}
              placeholder="Paste your access token here..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-700/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-600/60"
          >
            {loading ? 'Saving token...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <Link to="/" className="font-medium text-violet-400 hover:text-violet-300">
            Back to login options
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserLogin
