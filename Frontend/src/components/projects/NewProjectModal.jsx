import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createProject } from "@/api/projects";
import { useProjects } from "@/context/ProjectsContext";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-body text-slate-900 dark:text-slate-100 outline-none transition duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function NewProjectModal({ onClose }) {
  const navigate = useNavigate();
  const { refresh } = useProjects();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Project name is required.");
      return;
    }
    setNameError("");
    setSubmitError("");
    setLoading(true);
    try {
      const project = await createProject({
        name: trimmedName,
        description: description.trim() || null,
      });
      await refresh();
      onClose();
      navigate(`/board/${project.id}`);
    } catch (err) {
      setSubmitError(err.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="New Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="project-name"
          label="Project name"
          placeholder="e.g. Sprint Alpha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          autoFocus
        />

        <div className="space-y-1.5">
          <label
            htmlFor="project-desc"
            className="block text-small font-medium text-slate-600 dark:text-slate-400"
          >
            Description{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </label>
          <textarea
            id="project-desc"
            rows={3}
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={TEXTAREA_CLASS}
          />
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 py-2.5">
          <p className="text-small text-blue-700 dark:text-blue-400">
            Default stages will be created:{" "}
            <span className="font-medium">To Do · In Progress · Review · Done</span>
          </p>
        </div>

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
            {loading ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
