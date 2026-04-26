import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const SESSION_KEY = "habit-tracker-session";

const emptyAuthForm = {
  displayName: "",
  username: "",
  password: "",
};

async function readErrorMessage(response, fallbackMessage) {
  const clonedResponse = response.clone();

  try {
    const data = await response.json();
    if (data && typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch (error) {
    console.error("Failed to parse API error as JSON", error);
  }

  try {
    const text = await clonedResponse.text();
    if (text.trim()) {
      return text.trim();
    }
  } catch (error) {
    console.error("Failed to parse API error as text", error);
  }

  return fallbackMessage;
}

function App() {
  const [session, setSession] = useState(() => {
    const stored = window.localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [view, setView] = useState(() => {
    const stored = window.localStorage.getItem(SESSION_KEY);
    return stored ? "dashboard" : "auth";
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [habits, setHabits] = useState([]);
  const [habitName, setHabitName] = useState("");
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [habitLoading, setHabitLoading] = useState(false);
  const [completingHabitId, setCompletingHabitId] = useState(null);
  const [authError, setAuthError] = useState("");
  const [habitError, setHabitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setView("dashboard");
    } else {
      window.localStorage.removeItem(SESSION_KEY);
      setView("auth");
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
          ? `Welcome, ${user.displayName}.`
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

      const createdHabit = await response.json();
      setHabitName("");
      setSuccessMessage("Habit added.");
      setHabits((current) => [...current, createdHabit]);
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
    setCompletingHabitId(id);

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

      const updatedHabit = await response.json();
      setSuccessMessage("Habit marked complete.");
      setHabits((current) =>
        current.map((habit) => (habit.id === id ? updatedHabit : habit)),
      );
    } catch (error) {
      console.error("Failed to update habit", error);
      setHabitError("The server could not update that habit right now.");
    } finally {
      setCompletingHabitId(null);
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

  return (
    <div className="app-shell">
      <header className="navbar">
        <button type="button" className="brand" onClick={() => setView(session ? "dashboard" : "auth")}>
          HabitFlow
        </button>

        <nav className="nav-actions">
          {session ? (
            <>
              <span className="nav-user">@{session.username}</span>
              <button type="button" className="nav-button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={view === "auth" && authMode === "login" ? "nav-button active" : "nav-button"}
                onClick={() => {
                  setView("auth");
                  setAuthMode("login");
                  setAuthError("");
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={view === "auth" && authMode === "register" ? "nav-button active" : "nav-button"}
                onClick={() => {
                  setView("auth");
                  setAuthMode("register");
                  setAuthError("");
                }}
              >
                Register
              </button>
            </>
          )}
        </nav>
      </header>

      {view === "auth" || !session ? (
        <main className="page page-auth">
          <section className="intro-card">
            <p className="eyebrow">Minimal Habit Tracker</p>
            <h1>Track your daily habits with a clean, focused workflow.</h1>
            <p className="intro-copy">
              Create an account, log in, and keep your routine visible without extra clutter.
            </p>
          </section>

          <section className="auth-card">
            <div className="auth-header">
              <h2>{authMode === "register" ? "Create account" : "Login"}</h2>
              <p>
                {authMode === "register"
                  ? "Start with a simple profile."
                  : "Continue with your account."}
              </p>
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
        </main>
      ) : (
        <main className="page page-dashboard">
          <section className="dashboard-hero">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1>Welcome, {session.displayName}</h1>
              <p className="intro-copy">Add habits, complete them, and keep the streak going.</p>
            </div>
          </section>

          <section className="composer-card">
            <form className="composer-form" onSubmit={addHabit}>
              <input
                value={habitName}
                onChange={(event) => setHabitName(event.target.value)}
                placeholder="Add a new habit"
              />
              <button
                className="primary-button"
                type="submit"
                disabled={habitLoading || !habitName.trim()}
              >
                {habitLoading ? "Adding..." : "Add"}
              </button>
            </form>

            {habitError ? <p className="message error">{habitError}</p> : null}
            {successMessage ? <p className="message success">{successMessage}</p> : null}
          </section>

          <section className="habits-card">
            <div className="section-row">
              <h2>Your habits</h2>
              <span className="habit-count">{habits.length}</span>
            </div>

            {loadingHabits ? <p className="empty-state">Loading habits...</p> : null}

            {!loadingHabits && habits.length === 0 ? (
              <p className="empty-state">No habits yet. Add one to get started.</p>
            ) : null}

            <div className="habit-list">
              {habits.map((habit) => (
                <article className="habit-item" key={habit.id}>
                  <div className="habit-main">
                    <h3>{habit.name}</h3>
                    <p>
                      Streak: {habit.streak} day{habit.streak === 1 ? "" : "s"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={completingHabitId === habit.id}
                    onClick={() => completeHabit(habit.id)}
                  >
                    {completingHabitId === habit.id ? "Updating..." : "Complete"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
