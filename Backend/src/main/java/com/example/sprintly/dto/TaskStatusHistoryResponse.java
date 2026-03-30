package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class TaskStatusHistoryResponse {
    private Long stageId;
    private String stageName;
    private OffsetDateTime enteredAt;
}
