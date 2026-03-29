import { useState, useEffect } from "react";
import { Calendar, Trash2, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteTask, updateTask } from "@/api/tasks";

const PRIORITIES = ["low", "medium", "high"];

const priorityColor = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-600 dark:text-red-400",
};

const FIELD_CLASS =
  "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-small text-slate-900 dark:text-slate-100 outline-none transition duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function TaskDetailPanel({ task, stages, members, creatorEmail, role, onClose, onDeleted, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [assigneeEmail, setAssigneeEmail] = useState(task.assigneeEmail || creatorEmail || "");
  const [stageId, setStageId] = useState(task.stageId);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canEdit = role === "owner" || role === "participant";
  const canDelete = role === "owner";

  // Build assignee options: all members, fallback to creator
  const assigneeOptions = members && members.length > 0
    ? members
    : creatorEmail
    ? [{ email: creatorEmail, username: creatorEmail }]
    : [];

  // Reset form state when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDueDate(task.dueDate || "");
    setAssigneeEmail(task.assigneeEmail || creatorEmail || "");
    setStageId(task.stageId);
    setEditing(false);
    setError("");
  }, [task.id]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate || null,
        assigneeEmail: assigneeEmail || null,
        stageId,
      });
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      onDeleted(task.id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg animate-fade-in rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-card-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Task Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition duration-150"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-auto p-5 space-y-4">
          {editing ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-small font-medium text-slate-600 dark:text-slate-400">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-body text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition duration-150"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-small font-medium text-slate-600 dark:text-slate-400">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description…"
                  className="w-full resize-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-body text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 transition duration-150"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-small font-medium text-slate-600 dark:text-slate-400">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={FIELD_CLASS}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-small font-medium text-slate-600 dark:text-slate-400">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-small font-medium text-slate-600 dark:text-slate-400">
                  Assign to
                </label>
                <select
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                  className={FIELD_CLASS}
                >
                  {assigneeOptions.map((m) => (
                    <option key={m.email} value={m.email}>
                      {m.username || m.email}
                    </option>
                  ))}
                </select>
              </div>

              {stages && (
                <div className="space-y-1.5">
                  <label className="block text-small font-medium text-slate-600 dark:text-slate-400">
                    Stage
                  </label>
                  <select
                    value={stageId}
                    onChange={(e) => setStageId(Number(e.target.value))}
                    className={FIELD_CLASS}
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-body text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {task.description}
                </p>
              )}

              <div className="space-y-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3 text-small">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Priority</span>
                  <span className={`font-semibold capitalize ${priorityColor[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Due</span>
                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5" />
                      {task.dueDate}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="shrink-0 text-slate-500 dark:text-slate-400">Assigned to</span>
                  <span className="truncate text-right text-slate-700 dark:text-slate-300">
                    {(() => {
                      const email = task.assigneeEmail || creatorEmail;
                      if (!email) return "—";
                      const member = assigneeOptions.find((m) => m.email === email);
                      return member?.username || email;
                    })()}
                  </span>
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-small text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {/* Footer */}
        {canEdit && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between gap-2">
            {canDelete && !editing && (
              <Button
                variant="danger"
                className="!py-1.5 !text-small"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              {editing ? (
                <>
                  <Button
                    variant="secondary"
                    className="!py-1.5 !text-small"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="!py-1.5 !text-small"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  className="!py-1.5 !text-small gap-1.5"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
