import { useState } from "react";
import { Calendar, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deleteTask, updateTask } from "@/api/tasks";

const PRIORITIES = ["low", "medium", "high"];

const priorityColor = {
  low: "text-semantic-success",
  medium: "text-yellow-400",
  high: "text-semantic-error",
};

export function TaskDetailPanel({ task, stages, role, onClose, onDeleted, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [assigneeEmail, setAssigneeEmail] = useState(task.assigneeEmail || "");
  const [stageId, setStageId] = useState(task.stageId);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canEdit = role === "owner" || (role === "participant" && task.assigneeEmail);
  const canDelete = role === "owner";

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
        assigneeEmail: assigneeEmail.trim() || null,
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <span className="text-small font-medium text-gray-400">Task detail</span>
        <button type="button" onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200 transition duration-150">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {editing ? (
          <>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-graphite/60 px-3 py-2 text-body text-white outline-none focus:border-steel focus:ring-2 focus:ring-steel/30" />
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Description…"
              className="w-full resize-none rounded-lg border border-gray-600 bg-graphite/60 px-3 py-2 text-body text-gray-300 outline-none focus:border-steel focus:ring-2 focus:ring-steel/30" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-small text-gray-500">Priority</p>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-graphite px-2 py-1.5 text-small text-gray-100 outline-none focus:border-steel">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <p className="mb-1 text-small text-gray-500">Due date</p>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-graphite px-2 py-1.5 text-small text-gray-100 outline-none focus:border-steel" />
              </div>
            </div>

            <div>
              <p className="mb-1 text-small text-gray-500">Assignee email</p>
              <input value={assigneeEmail} onChange={(e) => setAssigneeEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-lg border border-gray-600 bg-graphite px-2 py-1.5 text-small text-gray-100 outline-none focus:border-steel" />
            </div>

            {stages && (
              <div>
                <p className="mb-1 text-small text-gray-500">Stage</p>
                <select value={stageId} onChange={(e) => setStageId(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-graphite px-2 py-1.5 text-small text-gray-100 outline-none focus:border-steel">
                  {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="font-semibold text-white text-base">{task.title}</h3>
            {task.description && <p className="text-body text-gray-400">{task.description}</p>}

            <div className="space-y-2 text-small">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Priority</span>
                <span className={`font-medium capitalize ${priorityColor[task.priority]}`}>{task.priority}</span>
              </div>
              {task.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Due</span>
                  <span className="inline-flex items-center gap-1 text-gray-300">
                    <Calendar className="h-3.5 w-3.5" /> {task.dueDate}
                  </span>
                </div>
              )}
              {task.assigneeEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Assignee</span>
                  <span className="text-gray-300">{task.assigneeEmail}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Role badge</span>
                <Badge role={task.assigneeEmail ? "participant" : "viewer"}>
                  {task.assigneeEmail ? "Participant" : "Unassigned"}
                </Badge>
              </div>
            </div>
          </>
        )}

        {error && <p className="text-small text-semantic-error">{error}</p>}
      </div>

      {/* Footer actions */}
      {canEdit && (
        <div className="border-t border-gray-700 p-3 flex items-center justify-between gap-2">
          {canDelete && !editing && (
            <Button variant="danger" className="!py-1.5 !text-small"
              onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            {editing ? (
              <>
                <Button variant="secondary" className="!py-1.5 !text-small"
                  onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
                <Button variant="primary" className="!py-1.5 !text-small"
                  onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </>
            ) : (
              <Button variant="secondary" className="!py-1.5 !text-small"
                onClick={() => setEditing(true)}>Edit</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
