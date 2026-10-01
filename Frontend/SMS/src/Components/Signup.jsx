import { useState } from "react";
import "../App.css";

function AccountPage({ mode, onModeChange, onBackToTester, onLoginSuccess }) {
  const [feedback, setFeedback] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    setFeedbackIsError(false);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if ((!isLogin && !name) || !email || !password) {
      setFeedback("Please fill in all fields.");
      setFeedbackIsError(true);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFeedback("Enter a valid email address.");
      setFeedbackIsError(true);
      return;
    }
    if (!isLogin && password.length < 6) {
      setFeedback("Password must be at least 6 characters.");
      setFeedbackIsError(true);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      email,
      password,
    };
    if (!isLogin) payload.name = name;

    let loggedInUser = null;
    try {
      const response = await fetch(`/api/auth/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Request failed.");

      if (isLogin) {
        localStorage.setItem("api_tester_token", result.token);
        loggedInUser = result.user;
      } else {
        setFeedback(result.message);
      }
    } catch (error) {
      setFeedback(
        error instanceof TypeError
          ? "Could not reach the auth API. Start the backend and try again."
          : error.message,
      );
      setFeedbackIsError(true);
    } finally {
      setIsSubmitting(false);
    }

    if (loggedInUser) onLoginSuccess(loggedInUser);
  }

  function changeMode(nextMode) {
    setFeedback("");
    setFeedbackIsError(false);
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

          <form className="account-form" onSubmit={handleSubmit} noValidate>
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
              placeholder={isLogin ? "Your password" : "At least 6 characters"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={isLogin ? undefined : 6}
              required
            />

            <button className="account-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
            </button>
            {feedback && (
              <p className={feedbackIsError ? "account-feedback error" : "account-feedback"} role={feedbackIsError ? "alert" : "status"}>
                {feedback}
              </p>
            )}
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