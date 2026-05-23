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

interface VotedOption { id: number; label: string; votes: { id: number; userId: number }[]; }
interface Poll { id: number; question: string; options: VotedOption[]; }
interface SpecialMeal {
  id: number;
  title: string;
  day: string;
  date: string;
  polls: Poll[];
}

export default function StudentPollsPage() {
  const router = useRouter();
  const [specialMeals, setSpecialMeals] = useState<SpecialMeal[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [votingFor, setVotingFor] = useState<Record<number, number>>({}); // pollId → optionId
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const raw = localStorage.getItem("mess-auth");
    if (!raw) return router.push("/");
    const { state } = JSON.parse(raw);
    if (state?.user?.role !== "STUDENT") return router.push("/");
    setUserId(state.user.id);
    fetchPolls();
  }, []);

  async function fetchPolls() {
    try {
      const { data } = await api.get("/api/polls/special-meals");
      setSpecialMeals(data);
    } catch { toast.error("Failed to load polls"); }
  }

  function hasVoted(poll: Poll, uid: number) {
    return poll.options.some(o => o.votes.some(v => v.userId === uid));
  }

  function getUserVotedOption(poll: Poll, uid: number): number | null {
    for (const opt of poll.options) {
      if (opt.votes.some(v => v.userId === uid)) return opt.id;
    }
    return null;
  }

  function totalVotes(poll: Poll) {
    return poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  }

  async function handleVote(pollId: number) {
    const optionId = votingFor[pollId];
    if (!optionId) return toast.error("Please select an option first");
    setLoading(p => ({ ...p, [pollId]: true }));
    try {
      await api.post(`/api/polls/${pollId}/vote`, { optionId });
      toast.success("Vote cast! 🗳️");
      fetchPolls();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Vote failed";
      toast.error(msg);
    } finally { setLoading(p => ({ ...p, [pollId]: false })); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f1a0f", color: "#e8f5e9", fontFamily: "'Georgia', serif" }}>
      <Toaster position="top-right" />

      <header style={{
        background: "#1a2e1a", borderBottom: "2px solid #2d5a2d",
        padding: "0 2rem", display: "flex", alignItems: "center",
        gap: "1rem", height: "64px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <a href="/student" style={{ color: "#66bb6a", textDecoration: "none", fontSize: "0.9rem" }}>← Back</a>
        <div>
          <div style={{ fontWeight: 700, color: "#a5d6a7" }}>🗳️ Special Meal Polls</div>
          <div style={{ fontSize: "0.7rem", color: "#66bb6a", letterSpacing: "0.1em", textTransform: "uppercase" }}>Vote on upcoming meals</div>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: "750px", margin: "0 auto" }}>
        {specialMeals.length === 0 && (
          <div style={{ textAlign: "center", color: "#558b57", padding: "4rem 2rem", background: "#1a2e1a", borderRadius: "12px", border: "1px dashed #2d5a2d" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗳️</div>
            <div style={{ fontSize: "1.1rem", color: "#81c784" }}>No active polls right now</div>
            <div style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Check back when the mess admin creates a special meal event.</div>
          </div>
        )}

        {specialMeals.map(sm => (
          <div key={sm.id} style={{
            background: "#1a2e1a", border: "1px solid #2d5a2d",
            borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem",
          }}>
            {/* Meal header */}
            <div style={{ marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid #2d5a2d" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🍽️</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#a5d6a7", fontSize: "1.1rem" }}>{sm.title}</div>
                  <div style={{ color: "#558b57", fontSize: "0.85rem" }}>
                    {sm.day} · {new Date(sm.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </div>
                </div>
              </div>
            </div>

            {/* Each poll */}
            {sm.polls.map(poll => {
              const voted = userId !== null && hasVoted(poll, userId);
              const userOptId = userId !== null ? getUserVotedOption(poll, userId) : null;
              const total = totalVotes(poll);

              return (
                <div key={poll.id} style={{
                  background: "#0f1a0f", border: "1px solid #2d5a2d",
                  borderRadius: "8px", padding: "1.25rem", marginBottom: "0.75rem",
                }}>
                  <div style={{ fontWeight: 600, color: "#81c784", marginBottom: "1rem", fontSize: "0.95rem" }}>
                    {poll.question}
                  </div>

                  {/* Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: voted ? "0" : "1rem" }}>
                    {poll.options.map(opt => {
                      const pct = total > 0 ? Math.round((opt.votes.length / total) * 100) : 0;
                      const isUserVote = userOptId === opt.id;
                      const isSelected = votingFor[poll.id] === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => !voted && setVotingFor(p => ({ ...p, [poll.id]: opt.id }))}
                          style={{
                            background: isSelected ? "#2d5a2d" : "#1a2e1a",
                            border: isUserVote ? "2px solid #66bb6a" : isSelected ? "2px solid #4a8c4a" : "1px solid #2d5a2d",
                            borderRadius: "6px",
                            padding: "0.75rem 1rem",
                            cursor: voted ? "default" : "pointer",
                            transition: "all 0.15s ease",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Vote bar background */}
                          {voted && (
                            <div style={{
                              position: "absolute", left: 0, top: 0, bottom: 0,
                              width: `${pct}%`, background: isUserVote ? "#2d5a2d" : "#1e3a1e",
                              transition: "width 0.6s ease",
                            }} />
                          )}

                          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {!voted && (
                                <div style={{
                                  width: "16px", height: "16px", borderRadius: "50%",
                                  border: isSelected ? "2px solid #66bb6a" : "2px solid #558b57",
                                  background: isSelected ? "#66bb6a" : "transparent",
                                  flexShrink: 0,
                                }} />
                              )}
                              {isUserVote && <span style={{ color: "#66bb6a", fontSize: "0.9rem" }}>✓</span>}
                              <span style={{ color: isUserVote ? "#a5d6a7" : "#c8e6c9", fontSize: "0.9rem" }}>{opt.label}</span>
                            </div>
                            {voted && (
                              <span style={{ color: "#66bb6a", fontSize: "0.85rem", fontWeight: 600 }}>
                                {pct}% <span style={{ color: "#558b57", fontWeight: 400 }}>({opt.votes.length})</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vote button or "already voted" */}
                  {!voted ? (
                    <button
                      onClick={() => handleVote(poll.id)}
                      disabled={!votingFor[poll.id] || loading[poll.id]}
                      style={{
                        background: votingFor[poll.id] ? "#2d5a2d" : "#152215",
                        color: votingFor[poll.id] ? "#a5d6a7" : "#558b57",
                        border: `1px solid ${votingFor[poll.id] ? "#66bb6a" : "#2d5a2d"}`,
                        padding: "0.5rem 1.25rem", borderRadius: "4px",
                        cursor: votingFor[poll.id] ? "pointer" : "not-allowed",
                        fontFamily: "inherit", fontSize: "0.9rem", width: "100%",
                        transition: "all 0.2s",
                      }}
                    >
                      {loading[poll.id] ? "Submitting..." : "Cast Vote"}
                    </button>
                  ) : (
                    <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#558b57", marginTop: "0.75rem" }}>
                      ✓ You voted · {total} total vote{total !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </main>
    </div>
  );
}