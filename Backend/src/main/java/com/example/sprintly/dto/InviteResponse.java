package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InviteResponse {
    private Long id;
    private String email;
    private String role;
    private String token;
    private String status;
    private String inviteUrl;
    private String expiresAt;
}
