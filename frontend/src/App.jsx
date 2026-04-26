import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const SESSION_KEY = "habit-tracker-session";

const emptyAuthForm = {
  displayName: "",
  username: "",
  password: "",
};

async function readErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (data && typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch (error) {
    console.error("Failed to parse API error", error);
  }
  return fallbackMessage;
}

function App() {
  const [session, setSession] = useState(() => {
    const stored = window.localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [habits, setHabits] = useState([]);
  const [habitName, setHabitName] = useState("");
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [habitLoading, setHabitLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [habitError, setHabitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.username) {
      setHabits([]);
      return;
    }
    loadHabits(session.username);
  }, [session?.username]);

  async function loadHabits(username) {
    setLoadingHabits(true);
    setHabitError("");
    try {
      const response = await fetch(
        `${API_BASE}/habits?username=${encodeURIComponent(username)}`,
      );
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Could not load habits."));
      }
      const data = await response.json();
      setHabits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load habits", error);
      setHabitError(error.message || "Backend is unreachable. Please try again.");
    } finally {
      setLoadingHabits(false);
    }
  }

  function updateAuthField(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");
    setSuccessMessage("");
    setAuthLoading(true);

    const endpoint =
      authMode === "register" ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
    const payload =
      authMode === "register"
        ? authForm
        : { username: authForm.username, password: authForm.password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setAuthError(
          await readErrorMessage(
            response,
            authMode === "register"
              ? "Could not create your account."
              : "Could not sign you in.",
          ),
        );
        return;
      }

      const user = await response.json();
      setSession(user);
      setAuthForm(emptyAuthForm);
      setSuccessMessage(
        authMode === "register"
          ? `Welcome, ${user.displayName}. Your account is ready.`
          : `Welcome back, ${user.displayName}.`,
      );
    } catch (error) {
      console.error("Authentication failed", error);
      setAuthError("The server could not be reached. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function addHabit(event) {
    event.preventDefault();
    if (!habitName.trim() || !session?.username) return;

    setHabitLoading(true);
    setHabitError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE}/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: habitName, username: session.username }),
      });

      if (!response.ok) {
        setHabitError(
          await readErrorMessage(response, "Could not create the habit. Please try again."),
        );
        return;
      }

      setHabitName("");
      setSuccessMessage("Habit added successfully.");
      await loadHabits(session.username);
    } catch (error) {
      console.error("Failed to create habit", error);
      setHabitError("The server could not create that habit right now.");
    } finally {
      setHabitLoading(false);
    }
  }

  async function completeHabit(id) {
    setHabitError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE}/habits/${id}/complete`, {
        method: "POST",
      });
      if (!response.ok) {
        setHabitError(
          await readErrorMessage(response, "Could not update the habit. Please try again."),
        );
        return;
      }

      setSuccessMessage("Streak updated.");
      await loadHabits(session.username);
    } catch (error) {
      console.error("Failed to update habit", error);
      setHabitError("The server could not update that habit right now.");
    }
  }

  function logout() {
    setSession(null);
    setHabits([]);
    setHabitName("");
    setAuthError("");
    setHabitError("");
    setSuccessMessage("");
    setAuthMode("login");
  }

  const completedToday = habits.filter(
    (habit) => habit.lastCompletedDate === new Date().toISOString().slice(0, 10),
  ).length;
  const bestStreak = habits.reduce((best, habit) => Math.max(best, habit.streak), 0);

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Habit Tracker</p>
        <h1>Build routines that are easy to start and satisfying to keep.</h1>
        <p className="hero-copy">
          Create an account, log in, and track daily progress with a cleaner
          dashboard that actually feels usable.
        </p>

        <div className="hero-grid">
          <article className="hero-card">
            <span>Simple accounts</span>
            <strong>Sign up and log in with your own username.</strong>
          </article>
          <article className="hero-card">
            <span>Daily momentum</span>
            <strong>Track streaks and today&apos;s completions at a glance.</strong>
          </article>
          <article className="hero-card">
            <span>One place</span>
            <strong>Frontend and backend stay connected through the same app URL.</strong>
          </article>
        </div>
      </section>

      {!session ? (
        <section className="auth-panel">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Account</p>
              <h2>{authMode === "register" ? "Create your profile" : "Welcome back"}</h2>
            </div>

            <div className="mode-switch" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setSuccessMessage("");
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === "register" ? "active" : ""}
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                  setSuccessMessage("");
                }}
              >
                Register
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" ? (
              <label>
                Display name
                <input
                  value={authForm.displayName}
                  onChange={(event) => updateAuthField("displayName", event.target.value)}
                  placeholder="Arjun Gowda"
                />
              </label>
            ) : null}

            <label>
              Username
              <input
                value={authForm.username}
                onChange={(event) => updateAuthField("username", event.target.value)}
                placeholder="arjun"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => updateAuthField("password", event.target.value)}
                placeholder="Minimum 4 characters"
              />
            </label>

            {authError ? <p className="message error">{authError}</p> : null}
            {successMessage ? <p className="message success">{successMessage}</p> : null}

            <button className="primary-button" type="submit" disabled={authLoading}>
              {authLoading
                ? "Please wait..."
                : authMode === "register"
                  ? "Create account"
                  : "Login"}
            </button>
          </form>
        </section>
      ) : (
        <section className="dashboard-panel">
          <header className="dashboard-header">
            <div>
              <p className="section-kicker">Dashboard</p>
              <h2>{session.displayName}&apos;s habits</h2>
              <p className="muted">
                Signed in as <strong>@{session.username}</strong>
              </p>
            </div>
            <button type="button" className="ghost-button" onClick={logout}>
              Log out
            </button>
          </header>

          <div className="stats-grid">
            <article className="stat-card">
              <span>Active habits</span>
              <strong>{habits.length}</strong>
            </article>
            <article className="stat-card">
              <span>Completed today</span>
              <strong>{completedToday}</strong>
            </article>
            <article className="stat-card">
              <span>Best streak</span>
              <strong>{bestStreak}</strong>
            </article>
          </div>

          <form className="habit-composer" onSubmit={addHabit}>
            <div>
              <p className="section-kicker">New habit</p>
              <h3>Add something worth repeating</h3>
            </div>
            <div className="composer-row">
              <input
                value={habitName}
                onChange={(event) => setHabitName(event.target.value)}
                placeholder="Read 10 pages"
              />
              <button
                className="primary-button"
                type="submit"
                disabled={habitLoading || !habitName.trim()}
              >
                {habitLoading ? "Adding..." : "Add habit"}
              </button>
            </div>
          </form>

          {habitError ? <p className="message error">{habitError}</p> : null}
          {successMessage ? <p className="message success">{successMessage}</p> : null}

          <section className="habits-section">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Your list</p>
                <h3>Keep the streak alive</h3>
              </div>
            </div>

            {loadingHabits ? <p className="empty-state">Loading habits...</p> : null}

            {!loadingHabits && habits.length === 0 ? (
              <p className="empty-state">
                No habits yet. Add your first one to start building momentum.
              </p>
            ) : null}

            <div className="habit-grid">
              {habits.map((habit) => (
                <article className="habit-card" key={habit.id}>
                  <div className="habit-topline">
                    <span className="habit-badge">#{habit.id}</span>
                    <span className="habit-date">
                      {habit.lastCompletedDate
                        ? `Last done ${habit.lastCompletedDate}`
                        : "Not completed yet"}
                    </span>
                  </div>

                  <h4>{habit.name}</h4>

                  <div className="habit-metrics">
                    <div>
                      <span>Streak</span>
                      <strong>{habit.streak} day{habit.streak === 1 ? "" : "s"}</strong>
                    </div>
                    <div>
                      <span>Owner</span>
                      <strong>@{habit.username}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => completeHabit(habit.id)}
                  >
                    Mark complete
                  </button>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}
    </main>
  );
}

export default App;
