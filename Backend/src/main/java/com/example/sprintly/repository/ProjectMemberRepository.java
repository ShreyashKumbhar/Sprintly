package com.example.sprintly.repository;

import com.example.sprintly.model.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    @Query("SELECT pm.project.id FROM ProjectMember pm WHERE pm.user.email = :email")
    List<Long> findProjectIdsByUserEmail(@Param("email") String email);
}
