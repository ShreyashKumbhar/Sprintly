package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private String creatorEmail;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private int memberCount;
    private List<WorkflowStageResponse> stages;
}
