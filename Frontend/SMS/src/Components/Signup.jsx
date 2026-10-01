import { useState } from "react";
import "../App.css";

function AccountPage({ mode, onModeChange, onBackToTester }) {
  const [feedback, setFeedback] = useState("");
  const isLogin = mode === "login";

  function handleSubmit(event) {
    event.preventDefault();
    setFeedback(
      isLogin
        ? "Login form is ready to connect to your authentication API."
        : "Signup form is ready to connect to your account API.",
    );
  }

  function changeMode(nextMode) {
    setFeedback("");
    onModeChange(nextMode);
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <div className="account-brand">API Tester</div>
        <section className="account-card" aria-labelledby="account-title">
          <h1 id="account-title">{isLogin ? "Log in" : "Create account"}</h1>
          <p className="account-description">
            {isLogin ? "Welcome back." : "Sign up to get started."}
          </p>

          <div className="account-mode-switch" role="group" aria-label="Account type">
            <button
              className={!isLogin ? "active" : ""}
              type="button"
              aria-pressed={!isLogin}
              onClick={() => changeMode("signup")}
            >
              Sign up
            </button>
            <button
              className={isLogin ? "active" : ""}
              type="button"
              aria-pressed={isLogin}
              onClick={() => changeMode("login")}
            >
              Log in
            </button>
          </div>

          <form className="account-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <label htmlFor="full-name">Full name</label>
                <input
                  id="full-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </>
            )}

            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={isLogin ? "Your password" : "At least 8 characters"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={isLogin ? undefined : 8}
              required
            />

            <button className="account-submit" type="submit">
              {isLogin ? "Log in" : "Sign up"}
            </button>
            {feedback && <p className="account-feedback" role="status">{feedback}</p>}
          </form>

          <button className="account-back" type="button" onClick={onBackToTester}>
            Back to API Tester
          </button>
        </section>
      </div>
    </main>
  );
}

export default AccountPage;