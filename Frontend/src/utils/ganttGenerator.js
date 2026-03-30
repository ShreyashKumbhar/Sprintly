import ExcelJS from "exceljs";

export async function generateGanttChart(projectName, stages) {
  // Flatten and prepare all tasks
  const allTasks = stages.flatMap((stage) =>
    (stage.tasks || []).map((task) => ({
      ...task,
      stageName: stage.name,
    }))
  );

  // Sort tasks by due date
  const sortedTasks = allTasks.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  // Calculate date range
  const tasksWithDates = sortedTasks.filter((t) => t.dueDate);
  if (tasksWithDates.length === 0) {
    alert("No tasks with due dates found. Cannot generate Gantt chart.");
    return;
  }

  const startDate = new Date(
    Math.min(...tasksWithDates.map((t) => new Date(t.dueDate)))
  );
  const endDate = new Date(
    Math.max(...tasksWithDates.map((t) => new Date(t.dueDate)))
  );

  // Add 7 days padding
  startDate.setDate(startDate.getDate() - 7);
  endDate.setDate(endDate.getDate() + 7);

  // Generate date range (one column per day)
  const dateRange = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Gantt Chart");

  // Set column widths
  worksheet.columns = [
    { width: 25 }, // Task name
    { width: 15 }, // Assignee
    { width: 10 }, // Progress
    { width: 12 }, // Start date
    { width: 12 }, // Days
    ...dateRange.map(() => ({ width: 3 })), // Date columns
  ];

  // Header styling
  const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4CAF50" } };
  const headerFont = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };

  // Title
  const titleRow = worksheet.addRow([]);
  titleRow.getCell(1).value = `Project: ${projectName}`;
  titleRow.getCell(1).font = { bold: true, size: 14 };
  titleRow.height = 25;

  // Empty row
  worksheet.addRow([]);

  // Month/Year header row (grouped)
  const monthRow = worksheet.addRow([]);
  let currentMonth = null;
  let monthStartCol = 5;

  dateRange.forEach((date, idx) => {
    const month = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (month !== currentMonth) {
      if (currentMonth !== null) {
        monthRow.getCell(monthStartCol).value = currentMonth;
        monthRow.getCell(monthStartCol).alignment = {
          horizontal: "center",
          vertical: "center",
        };
        monthRow.getCell(monthStartCol).font = { bold: true, size: 10 };
      }
      currentMonth = month;
      monthStartCol = idx + 5;
    }
  });
  if (currentMonth) {
    monthRow.getCell(monthStartCol).value = currentMonth;
    monthRow.getCell(monthStartCol).alignment = {
      horizontal: "center",
      vertical: "center",
    };
    monthRow.getCell(monthStartCol).font = { bold: true, size: 10 };
  }

  // Day header row
  const dayRow = worksheet.addRow(["Task", "Assigned to", "Progress %", "Start", "Days", ...dateRange.map((d) => d.getDate())]);
  dayRow.fill = headerFill;
  dayRow.font = headerFont;
  dayRow.height = 20;
  dayRow.alignment = { horizontal: "center", vertical: "center" };

  // Add task rows
  const colors = [
    "FFB9E7BA", // Light green
    "FFAED581", // Light yellow-green
    "FFFFD966", // Light yellow
    "FFFFE699", // Lighter yellow
    "FFBDD7EE", // Light blue
  ];

  sortedTasks.forEach((task, taskIdx) => {
    const row = worksheet.addRow([
      task.title,
      task.assigneeEmail || "Unassigned",
      0,
      task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }) : "",
      1,
    ]);

    // Style task name cell
    row.getCell(1).font = { bold: true, size: 10 };
    row.getCell(1).alignment = { wrapText: true, vertical: "center" };

    // Progress cell
    row.getCell(3).alignment = { horizontal: "center" };

    // Date cells
    if (task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const dayIndex = dateRange.findIndex(
        (d) => d.toDateString() === taskDate.toDateString()
      );

      if (dayIndex !== -1) {
        const color = colors[taskIdx % colors.length];
        const barCell = row.getCell(dayIndex + 5);
        barCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
        barCell.border = {
          left: { style: "thin", color: { argb: "FF666666" } },
          right: { style: "thin", color: { argb: "FF666666" } },
        };
      }
    }

    row.height = 18;
  });

  // Add footer with legend
  worksheet.addRow([]);
  const legendRow = worksheet.addRow(["Legend:", "Green = Task on due date", "", "Use conditional formatting to extend bars for multi-day tasks"]);
  legendRow.getCell(1).font = { bold: true, italic: true };

  // Generate filename
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${projectName}-gantt-${timestamp}.xlsx`;

  // Write file
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  });
}
