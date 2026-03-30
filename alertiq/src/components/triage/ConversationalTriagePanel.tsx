import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Layers, MessageSquare, Trash2,
  ChevronDown, AlertTriangle, CheckCircle, Search,
  Clock, MessagesSquare, XCircle, MessageCircle, X,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { chatResponses, suggestedQueries, incidents, type Severity } from "../../data/mockData";
import BackButton from "../shared/BackButton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isContextTransfer?: boolean;
}

interface ChatSession {
  id: string;
  incidentId: string | null;
  incidentName: string;
  messages: Message[];
  savedAt: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#EB5928";

const severityColor: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#22C55E",
};

const statusMeta: Record<string, { icon: typeof AlertTriangle; color: string }> = {
  active:        { icon: AlertTriangle, color: "#EF4444" },
  investigating: { icon: Search,        color: "#F59E0B" },
  resolved:      { icon: CheckCircle,   color: "#22C55E" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findResponse(incidentId: string | null, query: string): string {
  if (!incidentId) {
    const q = query.toLowerCase();
    if (q.includes("hello") || q.includes("hi"))
      return "Hello! I'm AlertIQ, your AI operations assistant. Select an incident from the dropdown to start a focused investigation, or ask me general questions about your system.";
    if (q.includes("help") || q.includes("what can you"))
      return "I can help you:\n• Investigate active incidents — select one from the dropdown above\n• Explain root causes, impact, and timelines\n• Suggest remediation actions\n• Summarise blast radius and dependencies\n\nTry selecting an incident to get started.";
    return "I'm in general mode — no incident is currently selected. Select an incident from the dropdown for context-aware answers, or ask me anything about your systems.";
  }
  const qas = chatResponses[incidentId];
  if (!qas) return "I don't have pre-loaded information for this incident yet.";
  const lower = query.toLowerCase();
  for (const qa of qas) {
    if (qa.keywords.some((kw) => lower.includes(kw))) return qa.answer;
  }
  return `I'm still analysing incident ${incidentId}. Try asking about the root cause, impact, timeline, or recommended fixes.`;
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Chat Incident Selector ────────────────────────────────────────────────────

interface SelectorProps {
  value: string | null;
  onChange: (id: string | null) => void;
  fullWidthTrigger?: boolean;
}

function ChatIncidentSelector({ value, onChange, fullWidthTrigger }: SelectorProps) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref       = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setQuery("");
  }, [open]);

  const selected = value ? incidents.find((i) => i.id === value) : null;
  const triggerLabel = selected ? selected.name : "General Chat";
  const triggerDot   = selected ? severityColor[selected.severity] : "#6B7280";

  const filteredIncidents = query.trim()
    ? incidents.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.id.toLowerCase().includes(query.toLowerCase())
      )
    : incidents;

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 14px", borderRadius: 10,
          border: `1px solid ${open ? ACCENT : "var(--color-border)"}`,
          backgroundColor: open ? `${ACCENT}08` : "var(--color-bg-card)",
          cursor: "pointer", width: "100%", maxWidth: fullWidthTrigger ? "none" : 560,
          textAlign: "left", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          transition: "border-color 0.15s, background-color 0.15s",
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: triggerDot, flexShrink: 0, boxShadow: `0 0 5px ${triggerDot}80` }} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: selected ? 700 : 500, color: selected ? "var(--color-text-primary)" : "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {triggerLabel}
        </span>
        {selected && (
          <span style={{ fontSize: 11, fontWeight: 600, color: statusMeta[selected.status]?.color ?? "#999", backgroundColor: `${statusMeta[selected.status]?.color ?? "#999"}18`, padding: "2px 8px", borderRadius: 999, flexShrink: 0, textTransform: "capitalize" }}>
            {selected.status}
          </span>
        )}
        <ChevronDown style={{ width: 13, height: 13, color: "var(--color-text-muted)", flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, maxWidth: fullWidthTrigger ? "100%" : 560, backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.14)", zIndex: 200, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* Search input */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "var(--color-text-muted)" }} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or ID…"
                style={{ width: "100%", paddingLeft: 28, paddingRight: query ? 28 : 10, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "var(--color-hover-bg)", fontSize: 12, color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}>
                  <XCircle style={{ width: 11, height: 11 }} />
                </button>
              )}
            </div>
          </div>

          {/* General Chat — always pinned, never filtered */}
          {!query && (
            <button
              onClick={() => { onChange(null); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px", textAlign: "left", cursor: "pointer", backgroundColor: value === null ? `${ACCENT}08` : "transparent", border: "none", borderBottom: "1px solid var(--color-border)", flexShrink: 0, transition: "background-color 0.12s" }}
              onMouseEnter={(e) => { if (value !== null) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-hover-bg)"; }}
              onMouseLeave={(e) => { if (value !== null) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
            >
              <span style={{ width: 4, height: 36, borderRadius: 4, backgroundColor: "#6B7280", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                  <MessageCircle style={{ width: 13, height: 13, color: "#6B7280", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: value === null ? 700 : 500, color: value === null ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>General Chat</span>
                  {value === null && <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, backgroundColor: `${ACCENT}15`, padding: "1px 7px", borderRadius: 999 }}>Current</span>}
                </div>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>No incident context — ask general questions</span>
              </div>
              <XCircle style={{ width: 14, height: 14, color: "#6B7280", flexShrink: 0 }} />
            </button>
          )}

          {/* Scrollable incident list */}
          <div style={{ overflowY: "auto", maxHeight: 300 }}>
            {filteredIncidents.length === 0 ? (
              <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 12, color: "var(--color-text-muted)" }}>
                No incidents match "{query}"
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isActive = inc.id === value;
                const color = severityColor[inc.severity as Severity];
                const sm = statusMeta[inc.status] ?? statusMeta.active;
                const SIcon = sm.icon;
                return (
                  <button
                    key={inc.id}
                    onClick={() => { onChange(inc.id); setOpen(false); setQuery(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px", textAlign: "left", cursor: "pointer", backgroundColor: isActive ? `${ACCENT}08` : "transparent", border: "none", borderBottom: "1px solid var(--color-border)", transition: "background-color 0.12s" }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-hover-bg)"; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = isActive ? `${ACCENT}08` : "transparent"; }}
                  >
                    <span style={{ width: 4, height: 36, borderRadius: 4, backgroundColor: color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {inc.name}
                        </span>
                        {isActive && <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, backgroundColor: `${ACCENT}15`, padding: "1px 7px", borderRadius: 999, flexShrink: 0 }}>Current</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{inc.id}</span>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>·</span>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{inc.alertCount} alerts</span>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>·</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: sm.color }}>
                          <SIcon style={{ width: 10, height: 10 }} />{inc.status}
                        </span>
                      </div>
                    </div>
                    <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: `${color}20`, color, flexShrink: 0, textTransform: "capitalize" }}>
                      {inc.severity}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer count */}
          <div style={{ padding: "6px 14px", borderTop: "1px solid var(--color-border)", fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0 }}>
            {filteredIncidents.length} of {incidents.length} incidents
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Past Chats Panel ─────────────────────────────────────────────────────────

function PastChatsPanel({ sessions, onRestore }: { sessions: ChatSession[]; onRestore: (s: ChatSession) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 80 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "rgba(235,89,40,0.09)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Clock style={{ width: 24, height: 24, color: "var(--color-accent)" }} />
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 6 }}>No past chats yet</p>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", maxWidth: 280 }}>
          Chat sessions are saved here when you clear a conversation or switch incidents.
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
      {sessions.map((session) => {
        const isOpen = expanded === session.id;
        const incidentDot = session.incidentId
          ? (severityColor[incidents.find((i) => i.id === session.incidentId)?.severity ?? "low"] ?? "#6B7280")
          : "#6B7280";

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 10, borderRadius: 12, border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-card)", overflow: "hidden" }}
          >
            {/* Session header row */}
            <button
              onClick={() => setExpanded(isOpen ? null : session.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: incidentDot, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.incidentName}
                </p>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  {session.messages.length} messages · {formatRelativeTime(session.savedAt)}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRestore(session); }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600, color: ACCENT, backgroundColor: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, cursor: "pointer", flexShrink: 0 }}
              >
                Restore
              </button>
              <ChevronDown style={{ width: 13, height: 13, color: "var(--color-text-muted)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
            </button>

            {/* Expanded messages preview */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--color-border)", maxHeight: 280, overflowY: "auto" }}>
                    {session.messages.map((msg) => (
                      <div key={msg.id} style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                        {msg.role === "assistant" && (
                          <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "rgba(235,89,40,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <Bot style={{ width: 11, height: 11, color: ACCENT }} />
                          </div>
                        )}
                        <div style={{ maxWidth: "80%", padding: "7px 11px", borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px", fontSize: 12, lineHeight: 1.55, whiteSpace: "pre-wrap", backgroundColor: msg.role === "user" ? ACCENT : "var(--color-hover-bg)", color: msg.role === "user" ? "#fff" : "var(--color-text-secondary)", border: msg.role === "assistant" ? "1px solid var(--color-border)" : "none" }}>
                          {msg.content}
                        </div>
                        {msg.role === "user" && (
                          <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "rgba(235,89,40,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <User style={{ width: 11, height: 11, color: ACCENT }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Panel (full page or investigation drawer) ─────────────────────────────────

export interface ConversationalTriagePanelProps {
  variant: "page" | "drawer";
  /** Drawer only — closes the sheet */
  onClose?: () => void;
}

export function ConversationalTriagePanel({ variant, onClose }: ConversationalTriagePanelProps) {
  const location = useLocation();
  const { selectedIncidentId, incidentData, pendingChatContext, setPendingChatContext } = useAppContext();
  const isDrawer = variant === "drawer";

  // Local incident context — independent from global selector
  const [chatIncidentId, setChatIncidentId] = useState<string | null>(selectedIncidentId);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const [activeTab, setActiveTab]     = useState<"chat" | "history">("chat");
  const [sessions, setSessions]       = useState<ChatSession[]>([]);

  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const didConsumeContext = useRef(false);
  const isTransferSession = useRef(false);
  const selectedIncidentIdRef = useRef(selectedIncidentId);
  selectedIncidentIdRef.current = selectedIncidentId;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Full page: start fresh unless arriving with legacy transfer state from /chat redirect.
  useEffect(() => {
    if (isDrawer) return;
    const fromInvestigation = (location.state as { fromInvestigation?: boolean } | null)
      ?.fromInvestigation === true;

    if (!fromInvestigation) {
      setMessages([]);
      isTransferSession.current = false;
      didConsumeContext.current = false;
    }
  }, [isDrawer, location.state]);

  // Consume investigation → triage handoff whenever pending context is set (drawer open or Discuss).
  // Do not depend on selectedIncidentId here — changing it would cancel the assistant reply timeout.
  useEffect(() => {
    if (!pendingChatContext) return;
    const ctx = pendingChatContext;
    const incId = selectedIncidentIdRef.current;
    setPendingChatContext(null);
    isTransferSession.current = true;
    didConsumeContext.current = true;
    setChatIncidentId(incId);

    const userMsg: Message = { id: `u-ctx-${Date.now()}`, role: "user", content: ctx, isContextTransfer: true };
    setMessages([userMsg]);
    setIsTyping(true);

    const t = window.setTimeout(() => {
      const id = selectedIncidentIdRef.current;
      setMessages((prev) => [
        ...prev,
        {
          id: `a-ctx-${Date.now()}`,
          role: "assistant",
          content: findResponse(id, "fix resolve action recommendation"),
        },
      ]);
      setIsTyping(false);
    }, 900);
    return () => window.clearTimeout(t);
  }, [pendingChatContext, setPendingChatContext]);

  // Save current session to history before switching incident
  const saveSession = useCallback((msgs: Message[], incId: string | null) => {
    if (msgs.length === 0) return;
    const incName = incId
      ? (incidents.find((i) => i.id === incId)?.name ?? incId)
      : "General Chat";
    setSessions((prev) => [
      { id: `session-${Date.now()}`, incidentId: incId, incidentName: incName, messages: msgs, savedAt: new Date() },
      ...prev,
    ]);
  }, []);

  const handleIncidentChange = useCallback((id: string | null) => {
    saveSession(messages, chatIncidentId);
    setChatIncidentId(id);
    setMessages([]);
    setInput("");
    setIsTyping(false);
    isTransferSession.current = false;
    didConsumeContext.current = false;
  }, [messages, chatIncidentId, saveSession]);

  const handleSend = useCallback((text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text.trim() }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: findResponse(chatIncidentId, text) }]);
      setIsTyping(false);
    }, 700 + Math.random() * 600);
  }, [chatIncidentId]);

  const handleClear = useCallback(() => {
    saveSession(messages, chatIncidentId);
    setMessages([]);
    isTransferSession.current = false;
    didConsumeContext.current = false;
    setInput("");
    setIsTyping(false);
  }, [messages, chatIncidentId, saveSession]);

  const handleRestore = useCallback((session: ChatSession) => {
    saveSession(messages, chatIncidentId);
    setChatIncidentId(session.incidentId);
    setMessages(session.messages);
    setSessions((prev) => prev.filter((s) => s.id !== session.id));
    setActiveTab("chat");
  }, [messages, chatIncidentId, saveSession]);

  const hasMessages = messages.length > 0;
  const hasContextTransfer = messages.some((m) => m.isContextTransfer);
  const chatInc = chatIncidentId ? incidents.find((i) => i.id === chatIncidentId) : null;
  const suggestions = chatIncidentId ? (suggestedQueries[chatIncidentId] ?? []) : ["What can you help with?", "Tell me about general monitoring best practices"];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: isDrawer ? "12px 14px 14px" : "var(--page-pad)",
        paddingBottom: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: isDrawer ? "100%" : 860,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >

        {/* ── Header ────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {!isDrawer && <BackButton />}
            <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: "rgba(235,89,40,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MessageSquare style={{ width: 17, height: 17, color: ACCENT }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 2 }}>
                Conversational Triage
              </p>
            </div>
            {isDrawer && onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close triage"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg-card)",
                  cursor: "pointer",
                  flexShrink: 0,
                  color: "var(--color-text-muted)",
                }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            )}
            {/* Clear button */}
            <AnimatePresence>
              {hasMessages && activeTab === "chat" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={handleClear}
                  title="Clear & save to history"
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, backgroundColor: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 500, flexShrink: 0, transition: "border-color 0.15s, color 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#EF4444"; (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)"; }}
                >
                  <Trash2 style={{ width: 13, height: 13 }} />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Incident selector */}
          <ChatIncidentSelector
            value={chatIncidentId}
            onChange={handleIncidentChange}
            fullWidthTrigger={isDrawer}
          />
        </div>

        {/* ── Tab bar ────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 0, marginBottom: 14, borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
          {([
            { id: "chat",    label: "Active Chat",  icon: MessagesSquare },
            { id: "history", label: `History${sessions.length > 0 ? ` (${sessions.length})` : ""}`, icon: Clock },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? ACCENT : "var(--color-text-muted)", background: "transparent", border: "none", borderBottom: `2px solid ${isActive ? ACCENT : "transparent"}`, cursor: "pointer", transition: "color 0.15s", marginBottom: -1 }}
              >
                <TabIcon style={{ width: 13, height: 13 }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Active Chat tab ────────────────────────────────────── */}
        {activeTab === "chat" && (
          <>
            {/* Context transfer pill */}
            <AnimatePresence>
              {hasContextTransfer && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, backgroundColor: "rgba(235,89,40,0.07)", border: "1px solid rgba(235,89,40,0.2)", alignSelf: "flex-start", marginBottom: 12, flexShrink: 0 }}
                >
                  <Layers style={{ width: 12, height: 12, color: ACCENT }} />
                  <span style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>
                    Context transferred from Investigation — {chatIncidentId ?? incidentData.id}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 10, minHeight: 0 }}>
              {!hasMessages && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", paddingBottom: 60 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "rgba(235,89,40,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Bot style={{ width: 26, height: 26, color: ACCENT }} />
                  </div>
                  <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: chatInc ? 6 : 20 }}>
                    {chatInc ? `Ask me anything about this incident` : "Ask me anything"}
                  </p>
                  {chatInc && (
                    <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 20 }}>
                      Analysing <strong style={{ color: "var(--color-text-primary)" }}>{chatInc.name}</strong>
                    </p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 520 }}>
                    {suggestions.map((q) => (
                      <button key={q} onClick={() => handleSend(q)} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500, backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                  >
                    {msg.role === "assistant" && (
                      <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(235,89,40,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <Bot style={{ width: 16, height: 16, color: ACCENT }} />
                      </div>
                    )}
                    <div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 4 }}>
                      {msg.isContextTransfer && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: ACCENT, backgroundColor: "rgba(235,89,40,0.10)", padding: "2px 8px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4, alignSelf: "flex-end" }}>
                          <Layers style={{ width: 9, height: 9 }} />
                          Transferred from Investigation
                        </span>
                      )}
                      <div style={{ padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", backgroundColor: msg.role === "user" ? ACCENT : "var(--color-bg-card)", color: msg.role === "user" ? "#fff" : "var(--color-text-secondary)", border: msg.role === "assistant" ? "1px solid var(--color-border)" : "none", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        {msg.content}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(235,89,40,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <User style={{ width: 16, height: 16, color: ACCENT }} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(235,89,40,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot style={{ width: 16, height: 16, color: ACCENT }} />
                  </div>
                  <div style={{ padding: "10px 16px", borderRadius: "16px 16px 16px 4px", backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    {[0, 150, 300].map((delay) => (
                      <span key={delay} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--color-text-muted)", display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion chips */}
            {hasMessages && suggestions.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10, flexShrink: 0 }}>
                {suggestions.map((q) => (
                  <button key={q} onClick={() => handleSend(q)} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 500, backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              style={{ display: "flex", gap: 10, flexShrink: 0 }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={chatInc ? `Ask about ${chatInc.name}...` : "Ask me anything..."}
                style={{ flex: 1, backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "11px 16px", fontSize: 13, color: "var(--color-text-primary)", outline: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                style={{ padding: "11px 16px", borderRadius: 12, backgroundColor: ACCENT, color: "#fff", border: "none", cursor: input.trim() && !isTyping ? "pointer" : "not-allowed", opacity: !input.trim() || isTyping ? 0.45 : 1, display: "flex", alignItems: "center" }}
              >
                <Send style={{ width: 16, height: 16 }} />
              </button>
            </form>
          </>
        )}

        {/* ── History tab ────────────────────────────────────────── */}
        {activeTab === "history" && (
          <PastChatsPanel sessions={sessions} onRestore={handleRestore} />
        )}

      </div>
    </div>
  );
}
