package com.example.sprintly.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskMoveRequest {
    @NotNull
    private Long stageId;

    /**
     * 0-based index within the target stage after removing this task from its current stage.
     * If null, the task is appended to the end of the target stage.
     */
    private Integer position;
}
