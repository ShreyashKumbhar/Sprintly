package com.example.sprintly.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InviteRequest {
    private String email;
    private String username;
    @NotNull
    private String role; // "participant" or "viewer"
}
