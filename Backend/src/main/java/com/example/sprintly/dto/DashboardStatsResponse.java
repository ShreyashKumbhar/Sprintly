package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private int activeTasks;
    private int completedTasks;
    private int overdueTasks;
    private double completionPercent;
    private int totalProjects;
}
