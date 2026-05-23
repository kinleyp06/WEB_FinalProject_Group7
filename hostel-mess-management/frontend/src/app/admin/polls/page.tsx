"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("mess-auth");
  if (raw) {
    const { state } = JSON.parse(raw);
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
  }
  return config;
});

interface PollOption { label: string; }
interface PollQuestion { question: string; options: PollOption[]; }
interface SpecialMealForm {
  title: string;
  day: "Monday" | "Thursday";
  date: string;
  polls: PollQuestion[];
}

interface VotedOption { id: number; label: string; votes: { id: number }[]; }
interface Poll { id: number; question: string; options: VotedOption[]; }
interface SpecialMeal {
  id: number;
  title: string;
  day: string;
  date: string;
  createdAt: string;
  polls: Poll[];
}

const DEFAULT_POLLS: PollQuestion[] = [
  {
    question: "Which main dish do you prefer?",
    options: [{ label: "Traditional Ema Datshi" }, { label: "Chicken Curry" }, { label: "Mixed Vegetable" }],
  },
  {
    question: "Preferred side dish?",
    options: [{ label: "Red Rice" }, { label: "Noodles" }, { label: "Bread" }],
  },
];

export default function AdminPollsPage() {
  const router = useRouter();
  const [specialMeals, setSpecialMeals] = useState<SpecialMeal[]>([]);
  const [form, setForm] = useState<SpecialMealForm>({
    title: "",
    day: "Monday",
    date: "",
    polls: DEFAULT_POLLS.map(p => ({ ...p, options: p.options.map(o => ({ ...o })) })),
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("mess-auth");
    if (!raw) return router.push("/");
    const { state } = JSON.parse(raw);
    if (state?.user?.role !== "ADMIN") return router.push("/");
    fetchSpecialMeals();
  }, []);

  async function fetchSpecialMeals() {
    try {
      const { data } = await api.get("/api/polls/special-meals");
      setSpecialMeals(data);
    } catch { toast.error("Failed to load polls"); }
  }

  function addPoll() {
    setForm(p => ({
      ...p,
      polls: [...p.polls, { question: "", options: [{ label: "" }, { label: "" }] }],
    }));
  }

  function removePoll(pi: number) {
    setForm(p => ({ ...p, polls: p.polls.filter((_, i) => i !== pi) }));
  }

  function addOption(pi: number) {
    setForm(p => {
      const polls = [...p.polls];
      polls[pi] = { ...polls[pi], options: [...polls[pi].options, { label: "" }] };
      return { ...p, polls };
    });
  }

  function removeOption(pi: number, oi: number) {
    setForm(p => {
      const polls = [...p.polls];
      polls[pi] = { ...polls[pi], options: polls[pi].options.filter((_, i) => i !== oi) };
      return { ...p, polls };
    });
  }

  function updatePollQuestion(pi: number, value: string) {
    setForm(p => {
      const polls = [...p.polls];
      polls[pi] = { ...polls[pi], question: value };
      return { ...p, polls };
    });
  }

  function updateOption(pi: number, oi: number, value: string) {
    setForm(p => {
      const polls = [...p.polls];
      const options = [...polls[pi].options];
      options[oi] = { label: value };
      polls[pi] = { ...polls[pi], options };
      return { ...p, polls };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.polls.length === 0) return toast.error("Add at least one poll");
    for (const poll of form.polls) {
      if (!poll.question.trim()) return toast.error("All poll questions are required");
      if (poll.options.length < 2) return toast.error("Each poll needs at least 2 options");
      if (poll.options.some(o => !o.label.trim())) return toast.error("All option labels are required");
    }
    setLoading(true);
    try {
      await api.post("/api/polls/special-meals", {
        title: form.title,
        day: form.day,
        date: new Date(form.date).toISOString(),
        polls: form.polls,
      });
      toast.success("Special meal & polls created!");
      setForm({
        title: "", day: "Monday", date: "",
        polls: DEFAULT_POLLS.map(p => ({ ...p, options: p.options.map(o => ({ ...o })) })),
      });
      setShowForm(false);
      fetchSpecialMeals();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create";
      toast.error(msg);
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this special meal and all its polls?")) return;
    try {
      await api.delete(`/api/polls/special-meals/${id}`);
      toast.success("Deleted");
      fetchSpecialMeals();
    } catch { toast.error("Delete failed"); }
  }

  function totalVotes(poll: Poll) {
    return poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f1a0f", color: "#e8f5e9", fontFamily: "'Georgia', serif" }}>
      <Toaster position="top-right" />

      <header style={{
        background: "#1a2e1a", borderBottom: "2px solid #2d5a2d",
        padding: "0 2rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "64px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/admin" style={{ color: "#66bb6a", textDecoration: "none", fontSize: "0.9rem" }}>← Back</a>
          <div>
            <div style={{ fontWeight: 700, color: "#a5d6a7" }}>🗳️ Poll Management</div>
            <div style={{ fontSize: "0.7rem", color: "#66bb6a", letterSpacing: "0.1em", textTransform: "uppercase" }}>Special Meal Voting</div>
          </div>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{
          background: "#2d5a2d", color: "#a5d6a7", border: "1px solid #66bb6a",
          padding: "0.5rem 1.25rem", borderRadius: "4px", cursor: "pointer",
          fontFamily: "inherit", fontSize: "0.9rem",
        }}>{showForm ? "✕ Cancel" : "➕ New Special Meal"}</button>
      </header>

      <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{
            background: "#1a2e1a", border: "1px solid #66bb6a",
            borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem",
          }}>
            <h3 style={{ color: "#a5d6a7", marginBottom: "1.25rem" }}>Create Special Meal Event</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Meal Title</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required style={inputStyle} placeholder="e.g. Special Friday Feast" />
              </div>
              <div>
                <label style={labelStyle}>Day (Monday or Thursday only)</label>
                <select value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value as "Monday" | "Thursday" }))} style={inputStyle}>
                  <option value="Monday">Monday</option>
                  <option value="Thursday">Thursday</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required style={inputStyle} />
              </div>
            </div>

            {/* Polls */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h4 style={{ color: "#81c784", margin: 0 }}>Poll Questions</h4>
                <button type="button" onClick={addPoll} style={{ ...smallBtnStyle, borderColor: "#66bb6a", color: "#66bb6a" }}>
                  + Add Question
                </button>
              </div>

              {form.polls.map((poll, pi) => (
                <div key={pi} style={{ background: "#0f1a0f", border: "1px solid #2d5a2d", borderRadius: "6px", padding: "1rem", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <input
                      value={poll.question}
                      onChange={e => updatePollQuestion(pi, e.target.value)}
                      required
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder={`Question ${pi + 1}`}
                    />
                    <button type="button" onClick={() => removePoll(pi)} style={{ ...smallBtnStyle, borderColor: "#ef5350", color: "#ef5350" }}>✕</button>
                  </div>
                  <div style={{ paddingLeft: "0.5rem" }}>
                    {poll.options.map((opt, oi) => (
                      <div key={oi} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                        <input
                          value={opt.label}
                          onChange={e => updateOption(pi, oi, e.target.value)}
                          required
                          style={{ ...inputStyle, flex: 1 }}
                          placeholder={`Option ${oi + 1}`}
                        />
                        {poll.options.length > 2 && (
                          <button type="button" onClick={() => removeOption(pi, oi)} style={{ ...smallBtnStyle, borderColor: "#558b57", color: "#558b57" }}>−</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(pi)} style={{ ...smallBtnStyle, borderColor: "#558b57", color: "#558b57", marginTop: "0.25rem" }}>
                      + Option
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Creating..." : "🗳️ Create Special Meal & Polls"}
            </button>
          </form>
        )}

        {/* Existing Special Meals */}
        <h3 style={{ color: "#81c784", marginBottom: "1rem" }}>
          Active Special Meals ({specialMeals.length})
        </h3>

        {specialMeals.length === 0 && (
          <div style={{ textAlign: "center", color: "#558b57", padding: "3rem", background: "#1a2e1a", borderRadius: "8px", border: "1px dashed #2d5a2d" }}>
            No special meals created yet. Click "New Special Meal" to get started.
          </div>
        )}

        {specialMeals.map(sm => (
          <div key={sm.id} style={{ background: "#1a2e1a", border: "1px solid #2d5a2d", borderRadius: "8px", padding: "1.25rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#a5d6a7", fontSize: "1.05rem" }}>{sm.title}</div>
                <div style={{ color: "#558b57", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                  {sm.day} · {new Date(sm.date).toLocaleDateString()} · {sm.polls.length} poll{sm.polls.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button onClick={() => handleDelete(sm.id)} style={{
                background: "transparent", border: "1px solid #ef5350", color: "#ef5350",
                padding: "0.3rem 0.75rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem",
              }}>Delete</button>
            </div>

            {/* Poll results */}
            {sm.polls.map(poll => {
              const total = totalVotes(poll);
              return (
                <div key={poll.id} style={{ background: "#0f1a0f", borderRadius: "6px", padding: "0.9rem", marginBottom: "0.6rem" }}>
                  <div style={{ color: "#81c784", fontWeight: 600, marginBottom: "0.6rem", fontSize: "0.9rem" }}>{poll.question}</div>
                  {poll.options.map(opt => {
                    const pct = total > 0 ? Math.round((opt.votes.length / total) * 100) : 0;
                    return (
                      <div key={opt.id} style={{ marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.2rem" }}>
                          <span style={{ color: "#c8e6c9" }}>{opt.label}</span>
                          <span style={{ color: "#66bb6a" }}>{opt.votes.length} votes ({pct}%)</span>
                        </div>
                        <div style={{ background: "#1a2e1a", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                          <div style={{ background: "#66bb6a", height: "100%", width: `${pct}%`, borderRadius: "4px", transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ fontSize: "0.75rem", color: "#558b57", marginTop: "0.4rem" }}>Total votes: {total}</div>
                </div>
              );
            })}
          </div>
        ))}
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", color: "#81c784", marginBottom: "0.3rem", fontSize: "0.85rem" };
const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f1a0f", border: "1px solid #2d5a2d",
  color: "#e8f5e9", padding: "0.6rem 0.9rem", borderRadius: "4px",
  fontSize: "0.9rem", fontFamily: "inherit", boxSizing: "border-box", outline: "none",
};
const btnStyle: React.CSSProperties = {
  background: "#2d5a2d", color: "#a5d6a7", border: "1px solid #66bb6a",
  padding: "0.6rem 1.5rem", borderRadius: "4px", cursor: "pointer",
  fontSize: "0.9rem", fontFamily: "inherit",
};
const smallBtnStyle: React.CSSProperties = {
  background: "transparent", border: "1px solid", padding: "0.3rem 0.6rem",
  borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit",
  whiteSpace: "nowrap",
};