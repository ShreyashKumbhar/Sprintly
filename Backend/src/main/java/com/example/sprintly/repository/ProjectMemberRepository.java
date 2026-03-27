package com.example.sprintly.repository;

import com.example.sprintly.model.ProjectMember;
import com.example.sprintly.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    @Query("SELECT pm.project.id FROM ProjectMember pm WHERE pm.user.email = :email")
    List<Long> findProjectIdsByUserEmail(@Param("email") String email);

    Optional<ProjectMember> findByProjectIdAndUserEmail(Long projectId, String email);

    List<ProjectMember> findByProjectId(Long projectId);

    boolean existsByProjectIdAndUserEmail(Long projectId, String email);

    @Query("DELETE FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId")
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);

    @Query("SELECT pm.role FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.email = :email")
    Optional<UserRole> findRoleByProjectIdAndUserEmail(@Param("projectId") Long projectId, @Param("email") String email);
}
