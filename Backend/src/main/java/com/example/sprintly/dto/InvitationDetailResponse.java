package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvitationDetailResponse {
    private Long id;
    private String projectName;
    private String projectDescription;
    private String inviterEmail;
    private String role;
    private String status;
    private String expiresAt;
}
