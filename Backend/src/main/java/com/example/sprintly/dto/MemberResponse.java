package com.example.sprintly.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberResponse {
    private Long userId;
    private String email;
    private String username;
    private String role;
    private String joinedAt;
}
