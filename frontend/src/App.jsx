import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function App() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("demo-user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHabits() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/habits?username=${encodeURIComponent(username)}`,
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setHabits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load habits", error);
      setError("Backend is unreachable. Start the API and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHabits();
  }, [username]);

  async function addHabit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    const response = await fetch(`${API_BASE}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username }),
    });
    if (!response.ok) {
      setError("Could not create the habit. Please try again.");
      return;
    }

    setName("");
    await loadHabits();
  }

  async function completeHabit(id) {
    const response = await fetch(`${API_BASE}/habits/${id}/complete`, {
      method: "POST",
    });
    if (!response.ok) {
      setError("Could not update the habit. Please try again.");
      return;
    }
    await loadHabits();
  }

  return (
    <main className="container">
      <h1>Habit Tracker</h1>

      <form onSubmit={addHabit} className="form-row">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit"
        />
        <button type="submit">Add Habit</button>
      </form>

      {loading ? <p>Loading...</p> : null}
      {error ? <p>{error}</p> : null}

      <ul className="habit-list">
        {habits.map((habit) => (
          <li key={habit.id}>
            <div>
              <strong>{habit.name}</strong>
              <p>User: {habit.username}</p>
              <p>Streak: {habit.streak}</p>
              <p>Last Completed: {habit.lastCompletedDate || "Never"}</p>
            </div>
            <button onClick={() => completeHabit(habit.id)}>
              Mark Complete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
