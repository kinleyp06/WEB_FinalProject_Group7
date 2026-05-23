"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("mess-auth");
  if (raw) {
    const { state } = JSON.parse(raw);
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
  }
  return config;
});

type Tab = "dashboard" | "meals" | "announcements" | "suggestions";

interface MealPlan {
  id: number;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  weekStart: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

interface Suggestion {
  id: number;
  content: string;
  status: "PENDING" | "REVIEWED" | "IMPLEMENTED" | "FLAGGED";
  adminReply: string | null;
  createdAt: string;
  user: { name: string; email: string };
}

interface FeedbackStat {
  mealType: string;
  avgRating: number;
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  REVIEWED: "#3b82f6",
  IMPLEMENTED: "#22c55e",
  FLAGGED: "#ef4444",
};

const PIE_COLORS = ["#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");

  // Meals
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [mealForm, setMealForm] = useState({
    day: "", breakfast: "", lunch: "", dinner: "", weekStart: "",
  });

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annForm, setAnnForm] = useState({ title: "", content: "" });

  // Suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [replyMap, setReplyMap] = useState<Record<number, string>>({});

  // Analytics
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStat[]>([]);
  const [ratingDist, setRatingDist] = useState<{ name: string; value: number }[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("mess-auth");
    if (!raw) return router.push("/");
    const { state } = JSON.parse(raw);
    if (state?.user?.role !== "ADMIN") return router.push("/");
    fetchAll();
  }, []);

  async function fetchAll() {
    await Promise.all([fetchMeals(), fetchAnnouncements(), fetchSuggestions(), fetchFeedback()]);
  }

  async function fetchMeals() {
    try {
      const { data } = await api.get("/api/meals");
      setMeals(data);
    } catch { toast.error("Failed to load meals"); }
  }

  async function fetchAnnouncements() {
    try {
      const { data } = await api.get("/api/announcements");
      setAnnouncements(data);
    } catch { toast.error("Failed to load announcements"); }
  }

  async function fetchSuggestions() {
    try {
      const { data } = await api.get("/api/suggestions");
      setSuggestions(data);
    } catch { toast.error("Failed to load suggestions"); }
  }

  async function fetchFeedback() {
    try {
      const { data } = await api.get("/api/feedback");
      // Aggregate by mealType
      const grouped: Record<string, { total: number; count: number }> = {};
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach((f: { mealType: string; rating: number }) => {
        if (!grouped[f.mealType]) grouped[f.mealType] = { total: 0, count: 0 };
        grouped[f.mealType].total += f.rating;
        grouped[f.mealType].count += 1;
        dist[f.rating] = (dist[f.rating] || 0) + 1;
      });
      setFeedbackStats(
        Object.entries(grouped).map(([mealType, v]) => ({
          mealType,
          avgRating: parseFloat((v.total / v.count).toFixed(2)),
          count: v.count,
        }))
      );
      setRatingDist(
        Object.entries(dist).map(([star, value]) => ({ name: `${star}★`, value }))
      );
    } catch { /* silent */ }
  }

  async function handleCreateMeal(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/meals", mealForm);
      toast.success("Meal plan created!");
      setMealForm({ day: "", breakfast: "", lunch: "", dinner: "", weekStart: "" });
      fetchMeals();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create meal";
      toast.error(msg);
    } finally { setLoading(false); }
  }

  async function handleDeleteMeal(id: number) {
    if (!confirm("Delete this meal plan?")) return;
    try {
      await api.delete(`/api/meals/${id}`);
      toast.success("Deleted");
      fetchMeals();
    } catch { toast.error("Delete failed"); }
  }

  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/announcements", annForm);
      toast.success("Announcement posted!");
      setAnnForm({ title: "", content: "" });
      fetchAnnouncements();
    } catch { toast.error("Failed to post announcement"); } finally { setLoading(false); }
  }

  async function handleSuggestionUpdate(id: number, status: string) {
    try {
      await api.put(`/api/suggestions/${id}`, { status, adminReply: replyMap[id] || undefined });
      toast.success("Suggestion updated");
      fetchSuggestions();
    } catch { toast.error("Update failed"); }
  }

  async function handleLogout() {
    localStorage.removeItem("mess-auth");
    router.push("/");
  }

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "meals", label: "Meal Plans", icon: "🍽️" },
    { key: "announcements", label: "Announcements", icon: "📢" },
    { key: "suggestions", label: "Suggestions", icon: "💬" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f1a0f", color: "#e8f5e9", fontFamily: "'Georgia', serif" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <header style={{
        background: "#1a2e1a",
        borderBottom: "2px solid #2d5a2d",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🏫</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#a5d6a7", letterSpacing: "0.03em" }}>
              CST Hostel Mess
            </div>
            <div style={{ fontSize: "0.7rem", color: "#66bb6a", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Admin Control Panel
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="/admin/finance" style={{ color: "#81c784", textDecoration: "none", fontSize: "0.9rem" }}>💰 Finance</a>
          <a href="/admin/polls" style={{ color: "#81c784", textDecoration: "none", fontSize: "0.9rem" }}>🗳️ Polls</a>
          <button onClick={handleLogout} style={{
            background: "transparent", border: "1px solid #ef5350", color: "#ef5350",
            padding: "0.3rem 1rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem",
          }}>Logout</button>
        </div>
      </header>

      {/* Tab Nav */}
      <nav style={{
        background: "#152215",
        borderBottom: "1px solid #2d5a2d",
        display: "flex",
        padding: "0 2rem",
      }}>
        {TABS.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "transparent",
            border: "none",
            borderBottom: tab === key ? "3px solid #66bb6a" : "3px solid transparent",
            color: tab === key ? "#a5d6a7" : "#558b57",
            padding: "1rem 1.5rem",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontFamily: "inherit",
            transition: "color 0.2s",
          }}>{icon} {label}</button>
        ))}
      </nav>

      <main style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ── DASHBOARD TAB ── */}
        {tab === "dashboard" && (
          <div>
            <h2 style={{ color: "#a5d6a7", marginBottom: "1.5rem", fontSize: "1.3rem" }}>Analytics Overview</h2>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { label: "Total Meal Plans", value: meals.length, icon: "🍽️" },
                { label: "Announcements", value: announcements.length, icon: "📢" },
                { label: "Suggestions", value: suggestions.length, icon: "💬" },
                { label: "Pending Reviews", value: suggestions.filter(s => s.status === "PENDING").length, icon: "⏳" },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{
                  background: "#1a2e1a", border: "1px solid #2d5a2d",
                  borderRadius: "8px", padding: "1.25rem", textAlign: "center",
                }}>
                  <div style={{ fontSize: "1.8rem" }}>{icon}</div>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#a5d6a7" }}>{value}</div>
                  <div style={{ fontSize: "0.8rem", color: "#558b57" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            {feedbackStats.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ background: "#1a2e1a", border: "1px solid #2d5a2d", borderRadius: "8px", padding: "1.5rem" }}>
                  <h3 style={{ color: "#81c784", marginBottom: "1rem", fontSize: "1rem" }}>Avg Rating by Meal Type</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={feedbackStats}>
                      <XAxis dataKey="mealType" stroke="#558b57" />
                      <YAxis domain={[0, 5]} stroke="#558b57" />
                      <Tooltip contentStyle={{ background: "#1a2e1a", border: "1px solid #2d5a2d", color: "#e8f5e9" }} />
                      <Bar dataKey="avgRating" fill="#66bb6a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: "#1a2e1a", border: "1px solid #2d5a2d", borderRadius: "8px", padding: "1.5rem" }}>
                  <h3 style={{ color: "#81c784", marginBottom: "1rem", fontSize: "1rem" }}>Rating Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={ratingDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {ratingDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1a2e1a", border: "1px solid #2d5a2d", color: "#e8f5e9" }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {feedbackStats.length === 0 && (
              <div style={{ textAlign: "center", color: "#558b57", padding: "3rem", background: "#1a2e1a", borderRadius: "8px", border: "1px dashed #2d5a2d" }}>
                No feedback data yet. Charts will appear once students submit feedback.
              </div>
            )}
          </div>
        )}

        {/* ── MEALS TAB ── */}
        {tab === "meals" && (
          <div>
            <h2 style={{ color: "#a5d6a7", marginBottom: "1.5rem" }}>Meal Plan Management</h2>

            {/* Create form */}
            <form onSubmit={handleCreateMeal} style={{
              background: "#1a2e1a", border: "1px solid #2d5a2d",
              borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem",
            }}>
              <h3 style={{ color: "#81c784", marginBottom: "1rem" }}>Add New Meal Plan</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {(["day", "breakfast", "lunch", "dinner"] as const).map((field) => (
                  <div key={field}>
                    <label style={{ display: "block", color: "#81c784", marginBottom: "0.3rem", fontSize: "0.85rem", textTransform: "capitalize" }}>{field}</label>
                    <input
                      value={mealForm[field]}
                      onChange={e => setMealForm(p => ({ ...p, [field]: e.target.value }))}
                      required
                      style={inputStyle}
                      placeholder={field === "day" ? "e.g. Monday" : `Enter ${field}`}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", color: "#81c784", marginBottom: "0.3rem", fontSize: "0.85rem" }}>Week Start Date</label>
                  <input
                    type="date"
                    value={mealForm.weekStart}
                    onChange={e => setMealForm(p => ({ ...p, weekStart: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? "Creating..." : "➕ Create Meal Plan"}
              </button>
            </form>

            {/* Meal list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {meals.length === 0 && (
                <div style={{ textAlign: "center", color: "#558b57", padding: "2rem", background: "#1a2e1a", borderRadius: "8px", border: "1px dashed #2d5a2d" }}>No meal plans yet.</div>
              )}
              {meals.map(meal => (
                <div key={meal.id} style={{
                  background: "#1a2e1a", border: "1px solid #2d5a2d",
                  borderRadius: "8px", padding: "1rem 1.25rem",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <span style={{ color: "#a5d6a7", fontWeight: 600 }}>{meal.day}</span>
                    <span style={{ color: "#558b57", fontSize: "0.8rem", marginLeft: "0.75rem" }}>
                      Week of {new Date(meal.weekStart).toLocaleDateString()}
                    </span>
                    <div style={{ fontSize: "0.85rem", color: "#81c784", marginTop: "0.3rem" }}>
                      🌅 {meal.breakfast} &nbsp;|&nbsp; ☀️ {meal.lunch} &nbsp;|&nbsp; 🌙 {meal.dinner}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMeal(meal.id)} style={{ background: "transparent", border: "1px solid #ef5350", color: "#ef5350", padding: "0.3rem 0.75rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS TAB ── */}
        {tab === "announcements" && (
          <div>
            <h2 style={{ color: "#a5d6a7", marginBottom: "1.5rem" }}>Announcements</h2>

            <form onSubmit={handleCreateAnnouncement} style={{
              background: "#1a2e1a", border: "1px solid #2d5a2d",
              borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem",
            }}>
              <h3 style={{ color: "#81c784", marginBottom: "1rem" }}>Post Announcement</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", color: "#81c784", marginBottom: "0.3rem", fontSize: "0.85rem" }}>Title</label>
                  <input value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))} required style={inputStyle} placeholder="Announcement title" />
                </div>
                <div>
                  <label style={{ display: "block", color: "#81c784", marginBottom: "0.3rem", fontSize: "0.85rem" }}>Content</label>
                  <textarea value={annForm.content} onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))} required rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Write your announcement..." />
                </div>
              </div>
              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? "Posting..." : "📢 Post Announcement"}
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {announcements.map(ann => (
                <div key={ann.id} style={{ background: "#1a2e1a", border: "1px solid #2d5a2d", borderRadius: "8px", padding: "1.25rem" }}>
                  <div style={{ fontWeight: 600, color: "#a5d6a7" }}>{ann.title}</div>
                  <div style={{ color: "#c8e6c9", marginTop: "0.4rem", fontSize: "0.9rem" }}>{ann.content}</div>
                  <div style={{ color: "#558b57", fontSize: "0.75rem", marginTop: "0.5rem" }}>{new Date(ann.createdAt).toLocaleString()}</div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div style={{ textAlign: "center", color: "#558b57", padding: "2rem", background: "#1a2e1a", borderRadius: "8px", border: "1px dashed #2d5a2d" }}>No announcements yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ── SUGGESTIONS TAB ── */}
        {tab === "suggestions" && (
          <div>
            <h2 style={{ color: "#a5d6a7", marginBottom: "1.5rem" }}>Student Suggestions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {suggestions.length === 0 && (
                <div style={{ textAlign: "center", color: "#558b57", padding: "2rem", background: "#1a2e1a", borderRadius: "8px", border: "1px dashed #2d5a2d" }}>No suggestions yet.</div>
              )}
              {suggestions.map(s => (
                <div key={s.id} style={{ background: "#1a2e1a", border: "1px solid #2d5a2d", borderRadius: "8px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <span style={{ color: "#a5d6a7", fontWeight: 600 }}>{s.user?.name}</span>
                      <span style={{ color: "#558b57", fontSize: "0.8rem", marginLeft: "0.75rem" }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span style={{
                      background: STATUS_COLORS[s.status] + "22",
                      color: STATUS_COLORS[s.status],
                      border: `1px solid ${STATUS_COLORS[s.status]}44`,
                      padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem",
                    }}>{s.status}</span>
                  </div>
                  <p style={{ color: "#c8e6c9", marginBottom: "0.75rem", fontSize: "0.9rem" }}>{s.content}</p>

                  {s.adminReply && (
                    <div style={{ background: "#0f1a0f", border: "1px solid #2d5a2d", borderRadius: "4px", padding: "0.6rem 0.9rem", marginBottom: "0.75rem", fontSize: "0.85rem", color: "#81c784" }}>
                      <strong>Admin reply:</strong> {s.adminReply}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <input
                      placeholder="Write reply (optional)..."
                      value={replyMap[s.id] || ""}
                      onChange={e => setReplyMap(p => ({ ...p, [s.id]: e.target.value }))}
                      style={{ ...inputStyle, flex: 1, minWidth: "200px", padding: "0.4rem 0.75rem" }}
                    />
                    {(["REVIEWED", "IMPLEMENTED", "FLAGGED"] as const).map(st => (
                      <button key={st} onClick={() => handleSuggestionUpdate(s.id, st)} style={{
                        background: "transparent",
                        border: `1px solid ${STATUS_COLORS[st]}`,
                        color: STATUS_COLORS[st],
                        padding: "0.4rem 0.75rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.78rem",
                      }}>→ {st}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f1a0f", border: "1px solid #2d5a2d",
  color: "#e8f5e9", padding: "0.6rem 0.9rem", borderRadius: "4px",
  fontSize: "0.9rem", fontFamily: "inherit", boxSizing: "border-box",
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  marginTop: "1rem", background: "#2d5a2d", color: "#a5d6a7",
  border: "1px solid #66bb6a", padding: "0.6rem 1.5rem",
  borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem",
  fontFamily: "inherit",
};