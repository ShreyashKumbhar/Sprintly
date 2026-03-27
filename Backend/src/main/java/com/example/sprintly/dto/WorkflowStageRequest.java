package com.example.sprintly.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkflowStageRequest {
    @NotBlank
    private String name;
    @NotNull
    private Integer stageOrder;
}
