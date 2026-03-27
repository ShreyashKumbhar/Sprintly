package com.example.sprintly.security;

import com.example.sprintly.model.UserRole;
import com.example.sprintly.repository.ProjectMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Optional;

@Service
public class RbacService {

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    public String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    public Optional<UserRole> getRole(Long projectId) {
        return projectMemberRepository.findRoleByProjectIdAndUserEmail(projectId, currentEmail());
    }

    /** Throws 403 if current user does not have one of the allowed roles in the project. */
    public UserRole requireRole(Long projectId, UserRole... allowed) {
        UserRole role = getRole(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this project"));
        if (Arrays.stream(allowed).noneMatch(r -> r == role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
        }
        return role;
    }

    public boolean hasRole(Long projectId, UserRole... allowed) {
        return getRole(projectId)
                .map(role -> Arrays.stream(allowed).anyMatch(r -> r == role))
                .orElse(false);
    }
}
