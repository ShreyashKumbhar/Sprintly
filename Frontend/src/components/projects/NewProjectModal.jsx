import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createProject } from "@/api/projects";
import { useProjects } from "@/context/ProjectsContext";
import { LayoutTemplate, Target } from "lucide-react";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-body text-slate-900 dark:text-slate-100 outline-none transition duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function NewProjectModal({ onClose }) {
  const navigate = useNavigate();
  const { refresh } = useProjects();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [category, setCategory] = useState("Select");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = choose type

  function handleContinue(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Project name is required.");
      return;
    }
    setNameError("");
    setStep(2);
  }

  async function handleCreate(useTemplate) {
    setSubmitError("");
    setLoading(true);
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || null,
      });
      await refresh();
      onClose();
      navigate(`/board/${project.id}`, {
        state: useTemplate ? { useTemplate: true } : undefined,
      });
    } catch (err) {
      setSubmitError(err.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  }

  if (step === 2) {
    return (
      <Modal title="How do you want to start?" onClose={onClose}>
        <div className="space-y-4">
          <p className="text-small text-slate-500 dark:text-slate-400">
            Choose how to set up your project board.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Custom Goals */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleCreate(false)}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-center transition duration-150 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md disabled:opacity-60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition group-hover:scale-110">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Custom Goals
                </p>
                <p className="mt-1 text-small text-slate-500 dark:text-slate-400">
                  Start with an empty board and add your own tasks
                </p>
              </div>
            </button>

            {/* Use Template */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleCreate(true)}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-center transition duration-150 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md disabled:opacity-60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition group-hover:scale-110">
                <LayoutTemplate className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Use Template
                </p>
                <p className="mt-1 text-small text-slate-500 dark:text-slate-400">
                  Pre-filled with planning, design, dev & deployment tasks
                </p>
              </div>
            </button>
          </div>

          {submitError && (
            <p
              className="text-small text-red-600 dark:text-red-400"
              role="alert"
            >
              {submitError}
            </p>
          )}

          {loading && (
            <p className="text-small text-center text-slate-500 dark:text-slate-400">
              Creating project...
            </p>
          )}

          <div className="flex justify-start pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="New Project" onClose={onClose}>
      <form onSubmit={handleContinue} className="space-y-4">
        <Input
          id="project-name"
          label="Project name"
          placeholder="e.g. Sprint Alpha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          autoFocus
        />

        <div className="space-y-1.5" >
          <label
            htmlFor="project-desc"
            className="block text-small font-medium text-slate-600 dark:text-slate-400"
          >
            Description{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500 ">
              (optional)
            </span>
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

        {/*select category of project */}
        <div className="space-y-1.5" id="spacexx" >
      <label className="block text-small font-medium text-slate-600 dark:text-slate-400" >
        Category
      </label>

      <div className="select" >
        {/* Selected display */}
        <div className="selected">
          {category}
          <svg
            height="1em"
            viewBox="0 0 512 512"
            className="arrow"
          >
            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
          </svg>
        </div>

        {/* Options */}
        <div className="options">
          <div>
            <input
              id="all"
              name="option"
              type="radio"
              defaultChecked
              onChange={() => setCategory("Select")}
            />
            <label className="option" htmlFor="all" data-txt="Select" />
          </div>

          <div>
            <input
              id="web"
              name="option"
              type="radio"
              onChange={() => setCategory("Web Development")}
            />
            <label
              className="option"
              htmlFor="web"
              data-txt="Web Development"
            />
          </div>

          <div>
            <input
              id="mobile"
              name="option"
              type="radio"
              onChange={() => setCategory("Mobile Development")}
            />
            <label
              className="option"
              htmlFor="mobile"
              data-txt="Mobile Development"
            />
          </div>

          <div>
            <input
              id="design"
              name="option"
              type="radio"
              onChange={() => setCategory("Design")}
            />
            <label className="option" htmlFor="design" data-txt="Design" />
          </div>

          <div>
            <input
              id="marketing"
              name="option"
              type="radio"
              onChange={() => setCategory("Marketing")}
            />
            <label
              className="option"
              htmlFor="marketing"
              data-txt="Marketing"
            />
          </div>

          <div>
            <input
              id="other"
              name="option"
              type="radio"
              onChange={() => setCategory("Other")}
            />
            <label className="option" htmlFor="other" data-txt="Other" />
          </div>
        </div>
      </div>

      {/* Optional: show selected value */}
      {/* <p className="text-sm">Selected: {category}</p> */}
    </div>

        {submitError && (
          <p className="text-small text-red-600 dark:text-red-400" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Continue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
