package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class WorkflowStageResponse {
    private Long id;
    private String name;
    private Integer stageOrder;
    private List<TaskResponse> tasks;
}
