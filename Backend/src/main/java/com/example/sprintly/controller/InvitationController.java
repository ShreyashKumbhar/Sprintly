package com.example.sprintly.controller;

import com.example.sprintly.dto.InvitationDetailResponse;
import com.example.sprintly.dto.InviteRequest;
import com.example.sprintly.dto.InviteResponse;
import com.example.sprintly.model.*;
import com.example.sprintly.repository.*;
import com.example.sprintly.security.RbacService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class InvitationController {

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RbacService rbacService;

    // ── List my pending invitations (authenticated) ───────────────────────────

    @GetMapping("/invitations/mine")
    public List<InvitationDetailResponse> myInvitations() {
        String email = rbacService.currentEmail();
        return invitationRepository.findByEmailAndStatusOrderByCreatedAtDesc(email, InvitationStatus.pending)
                .stream()
                .filter(inv -> inv.getExpiresAt() == null || inv.getExpiresAt().isAfter(OffsetDateTime.now()))
                .map(inv -> InvitationDetailResponse.builder()
                        .id(inv.getId())
                        .token(inv.getToken())
                        .projectName(inv.getProject().getName())
                        .projectDescription(inv.getProject().getDescription())
                        .inviterEmail(inv.getInviter().getEmail())
                        .role(inv.getRole().name())
                        .status(inv.getStatus().name())
                        .expiresAt(inv.getExpiresAt() != null ? inv.getExpiresAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    // ── Send invitation (Owner only) ─────────────────────────────────────────

    @PostMapping("/projects/{projectId}/invite")
    public ResponseEntity<InviteResponse> sendInvite(
            @PathVariable Long projectId,
            @Valid @RequestBody InviteRequest req) {

        rbacService.requireRole(projectId, UserRole.owner);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        UserRole role;
        try {
            role = UserRole.valueOf(req.getRole().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role. Use 'participant' or 'viewer'");
        }
        if (role == UserRole.owner) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot invite as owner");
        }

        // Resolve email: either provided directly or looked up by username
        String targetEmail = req.getEmail();
        if ((targetEmail == null || targetEmail.isBlank()) && req.getUsername() != null && !req.getUsername().isBlank()) {
            User found = userRepository.findByUsername(req.getUsername())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No user found with username '" + req.getUsername() + "'"));
            targetEmail = found.getEmail();
        }
        if (targetEmail == null || targetEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either email or username is required");
        }

        // Prevent duplicate pending invitations
        if (invitationRepository.existsByProjectIdAndEmailAndStatus(projectId, targetEmail, InvitationStatus.pending)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A pending invitation already exists for this user");
        }

        // Also prevent inviting someone who is already a member
        if (projectMemberRepository.existsByProjectIdAndUserEmail(projectId, targetEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a member of this project");
        }

        User inviter = userRepository.findByEmail(rbacService.currentEmail())
                .orElseThrow();

        String token = UUID.randomUUID().toString();
        OffsetDateTime expiresAt = OffsetDateTime.now().plusDays(7);

        Invitation invitation = Invitation.builder()
                .project(project)
                .email(targetEmail)
                .token(token)
                .role(role)
                .inviter(inviter)
                .status(InvitationStatus.pending)
                .expiresAt(expiresAt)
                .build();
        invitation = invitationRepository.save(invitation);

        return ResponseEntity.ok(InviteResponse.builder()
                .id(invitation.getId())
                .email(invitation.getEmail())
                .role(invitation.getRole().name())
                .token(token)
                .status(InvitationStatus.pending.name())
                .inviteUrl("/invite/" + token)
                .expiresAt(expiresAt.toString())
                .build());
    }

    // ── Get invitation details by token (public — no auth) ───────────────────

    @GetMapping("/invitations/{token}")
    public ResponseEntity<InvitationDetailResponse> getInvitation(@PathVariable String token) {
        Invitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (inv.getStatus() != InvitationStatus.pending) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation is no longer valid");
        }
        if (inv.getExpiresAt() != null && inv.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation has expired");
        }

        return ResponseEntity.ok(InvitationDetailResponse.builder()
                .id(inv.getId())
                .projectName(inv.getProject().getName())
                .projectDescription(inv.getProject().getDescription())
                .inviterEmail(inv.getInviter().getEmail())
                .role(inv.getRole().name())
                .status(inv.getStatus().name())
                .expiresAt(inv.getExpiresAt() != null ? inv.getExpiresAt().toString() : null)
                .build());
    }

    // ── Accept invitation (authenticated user) ───────────────────────────────

    @PostMapping("/invitations/{token}/accept")
    public ResponseEntity<String> acceptInvitation(@PathVariable String token) {
        String currentEmail = rbacService.currentEmail();

        Invitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (inv.getStatus() != InvitationStatus.pending) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation has already been used or expired");
        }
        if (inv.getExpiresAt() != null && inv.getExpiresAt().isBefore(OffsetDateTime.now())) {
            inv.setStatus(InvitationStatus.expired);
            invitationRepository.save(inv);
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation has expired");
        }
        if (!inv.getEmail().equalsIgnoreCase(currentEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This invitation was not sent to your email address");
        }
        if (projectMemberRepository.existsByProjectIdAndUserEmail(inv.getProject().getId(), currentEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already a member of this project");
        }

        User user = userRepository.findByEmail(currentEmail).orElseThrow();

        ProjectMember member = ProjectMember.builder()
                .project(inv.getProject())
                .user(user)
                .role(inv.getRole())
                .build();
        projectMemberRepository.save(member);

        inv.setStatus(InvitationStatus.accepted);
        invitationRepository.save(inv);

        return ResponseEntity.ok("Invitation accepted. You are now a " + inv.getRole().name() + " in " + inv.getProject().getName());
    }
}
