package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardStatsResponse {
    private int activeTasks;
    private int completedTasks;
    private int overdueTasks;
    private double completionPercent;
    private int totalProjects;
    private List<StageCount> stagesBreakdown;

    @Data
    @Builder
    public static class StageCount {
        private String stageName;
        private int count;
    }
}
