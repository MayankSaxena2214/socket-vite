import { Link } from 'react-router-dom'

const RoleSelector = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-cyan-400">Access portal</p>
          <h1 className="mt-3 text-4xl font-bold">Choose your login</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            to="/customer-login"
            className="group rounded-2xl border border-slate-700 bg-slate-950 p-6 text-left transition hover:border-cyan-500 hover:bg-slate-900"
          >
            <p className="text-sm uppercase tracking-[0.18em] text-cyan-400">Customer</p>
            <h2 className="mt-4 text-2xl font-semibold">Customer login</h2>
            <p className="mt-3 text-sm text-slate-300">
              OTP-based login flow for customer users.
            </p>
            <span className="mt-5 inline-flex text-sm font-medium text-cyan-300 transition group-hover:text-cyan-200">
              Continue →
            </span>
          </Link>

          <Link
            to="/user-login"
            className="group rounded-2xl border border-slate-700 bg-slate-950 p-6 text-left transition hover:border-violet-500 hover:bg-slate-900"
          >
            <p className="text-sm uppercase tracking-[0.18em] text-violet-400">Staff</p>
            <h2 className="mt-4 text-2xl font-semibold">Admin / Support login</h2>
            <p className="mt-3 text-sm text-slate-300">
              Login for admin, super admin, and support agents.
            </p>
            <span className="mt-5 inline-flex text-sm font-medium text-violet-300 transition group-hover:text-violet-200">
              Continue →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RoleSelector
