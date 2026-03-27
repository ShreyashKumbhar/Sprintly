package com.example.sprintly.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskMoveRequest {
    @NotNull
    private Long stageId;
}
