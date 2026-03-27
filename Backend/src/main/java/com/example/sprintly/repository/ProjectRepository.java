package com.example.sprintly.repository;

import com.example.sprintly.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user.email = :email")
    List<Project> findAllByMemberEmail(@Param("email") String email);
}
