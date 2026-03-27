import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createProject } from "@/api/projects";
import { useProjects } from "@/context/ProjectsContext";

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
            className="block text-small font-medium text-gray-400"
          >
            Description{" "}
            <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <textarea
            id="project-desc"
            rows={3}
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-lg border border-gray-600 bg-graphite px-3 py-2.5 text-body text-gray-100 outline-none transition duration-150 placeholder:text-gray-500 focus:border-steel focus:ring-2 focus:ring-steel/30"
          />
        </div>
        <p className="text-small text-gray-500">
          Default stages will be created: <span className="text-gray-400">To Do · In Progress · Review · Done</span>
        </p>
        {submitError && (
          <p className="text-small text-semantic-error" role="alert">
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
