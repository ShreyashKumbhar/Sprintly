import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createTask } from "@/api/projects";

const PRIORITIES = ["low", "medium", "high"];

export function NewTaskModal({ projectId, stageId, stageName, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [titleError, setTitleError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) { setTitleError("Title is required."); return; }
    setTitleError("");
    setSubmitError("");
    setLoading(true);
    try {
      const task = await createTask(projectId, {
        title: trimmed,
        description: description.trim() || null,
        priority,
        dueDate: dueDate || null,
        assigneeEmail: assigneeEmail.trim() || null,
        stageId,
      });
      onCreated(task);
      onClose();
    } catch (err) {
      setSubmitError(err.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={`Add task to "${stageName}"`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="task-title" label="Title" placeholder="Task title"
          value={title} onChange={(e) => setTitle(e.target.value)} error={titleError} autoFocus />

        <div className="space-y-1.5">
          <label htmlFor="task-desc" className="block text-small font-medium text-gray-400">
            Description <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <textarea id="task-desc" rows={2} placeholder="Details…"
            value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-lg border border-gray-600 bg-graphite px-3 py-2.5 text-body text-gray-100 outline-none transition duration-150 placeholder:text-gray-500 focus:border-steel focus:ring-2 focus:ring-steel/30" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="task-priority" className="block text-small font-medium text-gray-400">Priority</label>
            <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-graphite px-3 py-2.5 text-body text-gray-100 outline-none focus:border-steel focus:ring-2 focus:ring-steel/30">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <Input id="task-due" label="Due date" type="date"
            value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <Input id="task-assignee" label="Assign to (email, optional)"
          placeholder="member@example.com"
          value={assigneeEmail} onChange={(e) => setAssigneeEmail(e.target.value)} />

        {submitError && <p className="text-small text-semantic-error" role="alert">{submitError}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creating…" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
