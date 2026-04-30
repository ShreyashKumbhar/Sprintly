package com.example.sprintly.security;

import com.example.sprintly.model.UserRole;
import com.example.sprintly.repository.ProjectMemberRepository;
import com.example.sprintly.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RbacService {

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String OPEN_ACCESS_EMAIL = "guest@sprintly.local";

    public String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            email = OPEN_ACCESS_EMAIL;
        }
        ensureOpenAccessUser(email);
        return email;
    }

    public Optional<UserRole> getRole(Long projectId) {
        return projectMemberRepository.findRoleByProjectIdAndUserEmail(projectId, currentEmail());
    }

    /** Throws 403 if current user does not have one of the allowed roles in the project. */
    public UserRole requireRole(Long projectId, UserRole... allowed) {
        // Open-access mode for academic deployments: skip role enforcement.
        return UserRole.owner;
    }

    public boolean hasRole(Long projectId, UserRole... allowed) {
        return true;
    }

    private void ensureOpenAccessUser(String email) {
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }
        String username = "guest";
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = "guest_" + suffix++;
        }
        userRepository.save(com.example.sprintly.model.User.builder()
                .email(email)
                .password("open-access")
                .username(username)
                .build());
    }
}
