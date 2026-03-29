import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createTask } from "@/api/projects";

const PRIORITIES = ["low", "medium", "high"];

const FIELD_CLASS =
  "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-body text-slate-900 dark:text-slate-100 outline-none transition duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const LABEL_CLASS =
  "block text-small font-medium text-slate-600 dark:text-slate-400";

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
    if (!trimmed) {
      setTitleError("Title is required.");
      return;
    }
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
    <Modal title={`New task — ${stageName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="task-title"
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          autoFocus
        />

        <div className="space-y-1.5">
          <label htmlFor="task-desc" className={LABEL_CLASS}>
            Description{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </label>
          <textarea
            id="task-desc"
            rows={2}
            placeholder="Add more details…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${FIELD_CLASS} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="task-priority" className={LABEL_CLASS}>
              Priority
            </label>
            <select
              id="task-priority"
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
          <Input
            id="task-due"
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Input
          id="task-assignee"
          label="Assign to (optional)"
          placeholder="member@example.com"
          value={assigneeEmail}
          onChange={(e) => setAssigneeEmail(e.target.value)}
        />

        {submitError && (
          <p className="text-small text-red-600 dark:text-red-400" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creating…" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
