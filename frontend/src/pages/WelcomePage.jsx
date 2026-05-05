// File to handle the welcome page.
// NOTE: Copilot wrote most ofthe HTML for this page.

import { Link } from 'react-router-dom'

export default function WelcomePage() {
  return (
    <section className="menu-screen welcome-screen">
      <h2>Welcome</h2>
      <p className="welcome-lede">
        Sign in to manage your account and devices, or create a new account to get started.
      </p>
      <p className="welcome-actions">
        <Link to="/welcome/login" className="welcome-action-link">
          Log in
        </Link>
        <span className="welcome-action-sep" aria-hidden="true">
          ·
        </span>
        <Link to="/welcome/register" className="welcome-action-link">
          Create account
        </Link>
      </p>
    </section>
  )
}
