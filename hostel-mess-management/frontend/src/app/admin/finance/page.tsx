"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
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

interface GroceryBill {
  id: number;
  description: string;
  totalCost: number;
  weekStart: string;
  receiptUrl: string | null;
  createdAt: string;
}

export default function FinancePage() {
  const router = useRouter();
  const [bills, setBills] = useState<GroceryBill[]>([]);
  const [form, setForm] = useState({ description: "", totalCost: "", weekStart: "" });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("mess-auth");
    if (!raw) return router.push("/");
    const { state } = JSON.parse(raw);
    if (state?.user?.role !== "ADMIN") return router.push("/");
    fetchBills();
  }, []);

  async function fetchBills() {
    try {
      const { data } = await api.get("/api/finance/bills");
      setBills(data);
    } catch { toast.error("Failed to load bills"); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("description", form.description);
      fd.append("totalCost", form.totalCost);
      fd.append("weekStart", form.weekStart);
      if (receipt) fd.append("receipt", receipt);

      const raw = localStorage.getItem("mess-auth");
      const token = raw ? JSON.parse(raw).state?.token : null;

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/finance/bills`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Bill added!");
      setForm({ description: "", totalCost: "", weekStart: "" });
      setReceipt(null);
      fetchBills();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to add bill";
      toast.error(msg);
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this bill?")) return;
    try {
      await api.delete(`/api/finance/bills/${id}`);
      toast.success("Bill deleted");
      fetchBills();
    } catch { toast.error("Delete failed"); }
  }

  const totalExpenditure = bills.reduce((sum, b) => sum + b.totalCost, 0);

  // Chart data: sort by weekStart
  const chartData = [...bills]
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime())
    .map(b => ({
      week: new Date(b.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cost: b.totalCost,
    }));

  return (
    <div style={{ minHeight: "100vh", background: "#0f1a0f", color: "#e8f5e9", fontFamily: "'Georgia', serif" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <header style={{
        background: "#1a2e1a", borderBottom: "2px solid #2d5a2d",
        padding: "0 2rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "64px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/admin" style={{ color: "#66bb6a", textDecoration: "none", fontSize: "0.9rem" }}>← Back</a>
          <div>
            <div style={{ fontWeight: 700, color: "#a5d6a7" }}>💰 Financial Management</div>
            <div style={{ fontSize: "0.7rem", color: "#66bb6a", letterSpacing: "0.1em", textTransform: "uppercase" }}>Grocery Bills & Receipts</div>
          </div>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Bills", value: bills.length, icon: "🧾" },
            { label: "Total Expenditure", value: `Nu. ${totalExpenditure.toLocaleString()}`, icon: "💵" },
            { label: "Avg per Week", value: bills.length ? `Nu. ${(totalExpenditure / bills.length).toFixed(0)}` : "—", icon: "📅" },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: "#1a2e1a", border: "1px solid #2d5a2d",
              borderRadius: "8px", padding: "1.25rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "1.8rem" }}>{icon}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#a5d6a7" }}>{value}</div>
              <div style={{ fontSize: "0.8rem", color: "#558b57" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Line Chart */}
        {chartData.length > 1 && (
          <div style={{ background: "#1a2e1a", border: "1px solid #2d5a2d", borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem" }}>
            <h3 style={{ color: "#81c784", marginBottom: "1rem", fontSize: "1rem" }}>Weekly Cost Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d5a2d" />
                <XAxis dataKey="week" stroke="#558b57" fontSize={12} />
                <YAxis stroke="#558b57" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1a2e1a", border: "1px solid #2d5a2d", color: "#e8f5e9" }} />
                <Line type="monotone" dataKey="cost" stroke="#66bb6a" strokeWidth={2} dot={{ fill: "#66bb6a" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Add Bill Form */}
        <form onSubmit={handleSubmit} style={{
          background: "#1a2e1a", border: "1px solid #2d5a2d",
          borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem",
        }}>
          <h3 style={{ color: "#81c784", marginBottom: "1rem" }}>Add New Bill</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required style={inputStyle} placeholder="e.g. Weekly vegetable purchase" />
            </div>
            <div>
              <label style={labelStyle}>Total Cost (Nu.)</label>
              <input type="number" min="0" step="0.01" value={form.totalCost} onChange={e => setForm(p => ({ ...p, totalCost: e.target.value }))} required style={inputStyle} placeholder="0.00" />
            </div>
            <div>
              <label style={labelStyle}>Week Start Date</label>
              <input type="date" value={form.weekStart} onChange={e => setForm(p => ({ ...p, weekStart: e.target.value }))} required style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Receipt (JPEG, PNG, PDF — max 5MB)</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => setReceipt(e.target.files?.[0] || null)}
                style={{ ...inputStyle, padding: "0.4rem" }}
              />
              {receipt && <div style={{ fontSize: "0.8rem", color: "#66bb6a", marginTop: "0.3rem" }}>📎 {receipt.name}</div>}
            </div>
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Saving..." : "➕ Add Bill"}
          </button>
        </form>

        {/* Bills List */}
        <h3 style={{ color: "#81c784", marginBottom: "1rem" }}>All Bills</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {bills.length === 0 && (
            <div style={{ textAlign: "center", color: "#558b57", padding: "2rem", background: "#1a2e1a", borderRadius: "8px", border: "1px dashed #2d5a2d" }}>
              No bills recorded yet.
            </div>
          )}
          {bills.map(bill => (
            <div key={bill.id} style={{
              background: "#1a2e1a", border: "1px solid #2d5a2d",
              borderRadius: "8px", padding: "1rem 1.25rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ color: "#a5d6a7", fontWeight: 600 }}>{bill.description}</div>
                <div style={{ fontSize: "0.8rem", color: "#558b57", marginTop: "0.2rem" }}>
                  Week of {new Date(bill.weekStart).toLocaleDateString()} · Added {new Date(bill.createdAt).toLocaleDateString()}
                </div>
                {bill.receiptUrl && (
                  <a href={`${process.env.NEXT_PUBLIC_API_URL}${bill.receiptUrl}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: "0.8rem", color: "#66bb6a", marginTop: "0.2rem", display: "inline-block" }}>
                    📎 View Receipt
                  </a>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ color: "#a5d6a7", fontWeight: 700, fontSize: "1.1rem" }}>
                  Nu. {bill.totalCost.toLocaleString()}
                </span>
                <button onClick={() => handleDelete(bill.id)} style={{
                  background: "transparent", border: "1px solid #ef5350", color: "#ef5350",
                  padding: "0.3rem 0.75rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem",
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", color: "#81c784", marginBottom: "0.3rem", fontSize: "0.85rem",
};
const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f1a0f", border: "1px solid #2d5a2d",
  color: "#e8f5e9", padding: "0.6rem 0.9rem", borderRadius: "4px",
  fontSize: "0.9rem", fontFamily: "inherit", boxSizing: "border-box", outline: "none",
};
const btnStyle: React.CSSProperties = {
  marginTop: "1rem", background: "#2d5a2d", color: "#a5d6a7",
  border: "1px solid #66bb6a", padding: "0.6rem 1.5rem",
  borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit",
};