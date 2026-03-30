import ExcelJS from "exceljs";

/**
 * Priority-based color coding (ARGB format for ExcelJS).
 * high = red tones, medium = amber tones, low = green tones
 */
const PRIORITY_COLORS = {
  high:   { bar: "FFEF9A9A", border: "FFE53935" },   // red
  medium: { bar: "FFFFE082", border: "FFFFA000" },   // amber
  low:    { bar: "FFA5D6A7", border: "FF43A047" },   // green
};
const DEFAULT_COLOR = { bar: "FFBDD7EE", border: "FF5B9BD5" }; // blue fallback

/**
 * Derive time segments from a task's statusHistory array.
 *
 * Each segment represents a continuous period in a stage:
 *   { stageName, start: Date, end: Date|null }
 *
 * Rules:
 * - "To Do" entries are skipped (task hasn't started yet)
 * - "In Progress" entry marks a startedAt
 * - "Done" entry marks a completedAt
 * - For the last segment, if end is null, use `now` as a temporary end
 * - Tasks can be reopened (moved back), producing multiple segments
 */
function deriveSegments(task, now) {
  const history = task.statusHistory || [];
  if (history.length === 0) {
    // No history — fallback to createdAt if available
    if (task.createdAt) {
      return [{
        stageName: task.currentStage || "Unknown",
        start: new Date(task.createdAt),
        end: task.currentStage?.toLowerCase() === "done" ? new Date(task.createdAt) : now,
      }];
    }
    return [];
  }

  const segments = [];

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    const stageName = entry.stageName;
    const enteredAt = new Date(entry.enteredAt);

    // Close previous segment
    if (segments.length > 0) {
      const prev = segments[segments.length - 1];
      if (!prev.end) {
        prev.end = enteredAt;
      }
    }

    // Skip "To Do" — task hasn't started work yet in this stage
    if (stageName.toLowerCase() === "to do") continue;

    segments.push({
      stageName,
      start: enteredAt,
      end: null, // will be closed by next entry or by `now`
    });
  }

  // Close the last open segment
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    if (!last.end) {
      last.end = last.stageName.toLowerCase() === "done" ? last.start : now;
    }
  }

  return segments;
}

/**
 * Generate and download a Gantt chart Excel file from the Gantt API data.
 *
 * @param {string} projectName - Name of the project
 * @param {Array} ganttTasks - Array of GanttTaskResponse from the API
 */
export async function generateGanttChart(projectName, ganttTasks) {
  const now = new Date();

  // Derive segments for every task
  const taskRows = ganttTasks.map((task) => ({
    ...task,
    segments: deriveSegments(task, now),
  }));

  // Filter to tasks that have at least one segment with a start date
  const activeTasks = taskRows.filter((t) => t.segments.length > 0);

  if (activeTasks.length === 0) {
    alert("No tasks with status history found. Move tasks to 'In Progress' to generate a Gantt chart.");
    return;
  }

  // Group by assignee
  const grouped = {};
  for (const task of activeTasks) {
    const key = task.assigneeEmail || "Unassigned";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(task);
  }

  // Sort each group chronologically by earliest segment start
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.segments[0].start - b.segments[0].start);
  }

  // Calculate date range from all segments
  let minDate = Infinity;
  let maxDate = -Infinity;
  for (const task of activeTasks) {
    for (const seg of task.segments) {
      if (seg.start < minDate) minDate = +seg.start;
      if (seg.end && +seg.end > maxDate) maxDate = +seg.end;
    }
  }
  const startDate = new Date(minDate);
  const endDate = new Date(maxDate);

  // Add 3 days padding on each side
  startDate.setDate(startDate.getDate() - 3);
  endDate.setDate(endDate.getDate() + 3);

  // Generate date columns (one per day)
  const dateRange = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dateRange.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // ── Build Excel ──────────────────────────────────────────────────────────
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Gantt Chart");

  const DATA_COLS = 5; // Task, Assignee, Priority, Stage, Duration
  ws.columns = [
    { width: 28 }, // Task name
    { width: 16 }, // Assignee
    { width: 10 }, // Priority
    { width: 12 }, // Current stage
    { width: 10 }, // Duration (days)
    ...dateRange.map(() => ({ width: 3 })),
  ];

  const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1565C0" } };
  const headerFont = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
  const todayCol = dateRange.findIndex(
    (d) => d.toDateString() === now.toDateString()
  );

  // ── Title row ──
  const titleRow = ws.addRow([]);
  titleRow.getCell(1).value = `Gantt Chart: ${projectName}`;
  titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: "FF1565C0" } };
  titleRow.height = 28;

  const subRow = ws.addRow([]);
  subRow.getCell(1).value = `Generated ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  subRow.getCell(1).font = { italic: true, size: 9, color: { argb: "FF888888" } };

  ws.addRow([]); // spacer

  // ── Month header row ──
  const monthRow = ws.addRow([]);
  let currentMonth = null;
  let monthStartCol = DATA_COLS;

  dateRange.forEach((date, idx) => {
    const month = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (month !== currentMonth) {
      if (currentMonth !== null) {
        monthRow.getCell(monthStartCol + 1).value = currentMonth;
        monthRow.getCell(monthStartCol + 1).alignment = { horizontal: "center" };
        monthRow.getCell(monthStartCol + 1).font = { bold: true, size: 9 };
      }
      currentMonth = month;
      monthStartCol = idx + DATA_COLS;
    }
  });
  if (currentMonth) {
    monthRow.getCell(monthStartCol + 1).value = currentMonth;
    monthRow.getCell(monthStartCol + 1).alignment = { horizontal: "center" };
    monthRow.getCell(monthStartCol + 1).font = { bold: true, size: 9 };
  }

  // ── Day header row ──
  const dayHeaders = ["Task", "Assignee", "Priority", "Stage", "Days", ...dateRange.map((d) => d.getDate())];
  const dayRow = ws.addRow(dayHeaders);
  dayRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: "center", vertical: "center" };
  });
  dayRow.getCell(1).alignment = { horizontal: "left", vertical: "center" };
  dayRow.height = 22;

  // ── Highlight today column header ──
  if (todayCol >= 0) {
    const todayCell = dayRow.getCell(todayCol + DATA_COLS + 1);
    todayCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF6F00" } };
  }

  // ── Task rows grouped by assignee ──
  const assignees = Object.keys(grouped).sort((a, b) =>
    a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : a.localeCompare(b)
  );

  for (const assignee of assignees) {
    // Group header
    const groupRow = ws.addRow([]);
    groupRow.getCell(1).value = assignee;
    groupRow.getCell(1).font = { bold: true, size: 10, color: { argb: "FF1565C0" } };
    groupRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE3F2FD" } };
    groupRow.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE3F2FD" } };
    groupRow.height = 20;

    for (const task of grouped[assignee]) {
      const segments = task.segments;

      // Calculate total duration across all segments
      let totalDays = 0;
      for (const seg of segments) {
        const diff = Math.ceil((seg.end - seg.start) / (1000 * 60 * 60 * 24));
        totalDays += Math.max(diff, 1);
      }

      const row = ws.addRow([
        task.title,
        task.assigneeEmail || "Unassigned",
        (task.priority || "medium").toUpperCase(),
        task.currentStage,
        totalDays,
      ]);

      row.getCell(1).font = { size: 10 };
      row.getCell(1).alignment = { wrapText: true, vertical: "center" };
      row.getCell(3).alignment = { horizontal: "center" };
      row.getCell(5).alignment = { horizontal: "center" };

      // Priority color for the priority cell
      const pColors = PRIORITY_COLORS[task.priority] || DEFAULT_COLOR;
      row.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: pColors.bar } };
      row.getCell(3).font = { bold: true, size: 9 };

      // Paint bar segments on the date columns
      for (const seg of segments) {
        for (let di = 0; di < dateRange.length; di++) {
          const d = dateRange[di];
          if (d >= seg.start && d <= seg.end) {
            const cell = row.getCell(di + DATA_COLS + 1);
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: pColors.bar } };
            cell.border = {
              top: { style: "thin", color: { argb: pColors.border } },
              bottom: { style: "thin", color: { argb: pColors.border } },
            };
          }
        }

        // Add left/right borders for segment edges
        const startIdx = dateRange.findIndex((d) => d.toDateString() === seg.start.toDateString());
        const endIdx = dateRange.findIndex((d) => d.toDateString() === seg.end.toDateString());
        if (startIdx >= 0) {
          row.getCell(startIdx + DATA_COLS + 1).border = {
            ...row.getCell(startIdx + DATA_COLS + 1).border,
            left: { style: "medium", color: { argb: pColors.border } },
          };
        }
        if (endIdx >= 0) {
          row.getCell(endIdx + DATA_COLS + 1).border = {
            ...row.getCell(endIdx + DATA_COLS + 1).border,
            right: { style: "medium", color: { argb: pColors.border } },
          };
        }
      }

      // Highlight today marker
      if (todayCol >= 0) {
        const todayTaskCell = row.getCell(todayCol + DATA_COLS + 1);
        todayTaskCell.border = {
          ...todayTaskCell.border,
          left: { style: "thin", color: { argb: "FFFF6F00" } },
          right: { style: "thin", color: { argb: "FFFF6F00" } },
        };
      }

      row.height = 20;
    }
  }

  // ── Legend ──
  ws.addRow([]);
  const legendTitle = ws.addRow(["Legend"]);
  legendTitle.getCell(1).font = { bold: true, size: 10 };

  const legends = [
    ["", "Red bar = High priority", "Amber bar = Medium priority", "Green bar = Low priority"],
    ["", "Orange column = Today", "Bars show actual time spent in each stage"],
  ];
  for (const row of legends) {
    const r = ws.addRow(row);
    r.getCell(2).font = { italic: true, size: 9, color: { argb: "FF666666" } };
    r.getCell(3).font = { italic: true, size: 9, color: { argb: "FF666666" } };
    r.getCell(4).font = { italic: true, size: 9, color: { argb: "FF666666" } };
  }

  // ── Download ──
  const timestamp = now.toISOString().split("T")[0];
  const filename = `${projectName}-gantt-${timestamp}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
