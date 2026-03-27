package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private String priority;
    private LocalDate dueDate;
    private String assigneeEmail;
    private Long stageId;
    private Integer position;
    private OffsetDateTime createdAt;
}
