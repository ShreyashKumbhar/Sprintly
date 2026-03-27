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
import java.util.UUID;

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

        // Prevent duplicate pending invitations
        if (invitationRepository.existsByProjectIdAndEmailAndStatus(projectId, req.getEmail(), InvitationStatus.pending)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A pending invitation already exists for this email");
        }

        // Also prevent inviting someone who is already a member
        if (projectMemberRepository.existsByProjectIdAndUserEmail(projectId, req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a member of this project");
        }

        User inviter = userRepository.findByEmail(rbacService.currentEmail())
                .orElseThrow();

        String token = UUID.randomUUID().toString();
        OffsetDateTime expiresAt = OffsetDateTime.now().plusDays(7);

        Invitation invitation = Invitation.builder()
                .project(project)
                .email(req.getEmail())
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
