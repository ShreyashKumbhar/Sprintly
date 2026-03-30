package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class GanttTaskResponse {
    private Long id;
    private String title;
    private String description;
    private String priority;
    private LocalDate dueDate;
    private String assigneeEmail;
    private String currentStage;
    private OffsetDateTime createdAt;
    private List<TaskStatusHistoryResponse> statusHistory;
}
