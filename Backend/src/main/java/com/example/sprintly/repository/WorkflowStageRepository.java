package com.example.sprintly.repository;

import com.example.sprintly.model.WorkflowStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowStageRepository extends JpaRepository<WorkflowStage, Long> {
    List<WorkflowStage> findByProjectIdOrderByStageOrderAsc(Long projectId);
}
