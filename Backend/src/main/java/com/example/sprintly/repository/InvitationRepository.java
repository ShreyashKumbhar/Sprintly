package com.example.sprintly.repository;

import com.example.sprintly.model.Invitation;
import com.example.sprintly.model.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    Optional<Invitation> findByToken(String token);
    boolean existsByProjectIdAndEmailAndStatus(Long projectId, String email, InvitationStatus status);
}
