package com.example.sprintly.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.sprintly.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssigneeId(Long assigneeId);

    List<Task> findByStage_IdOrderByPositionAsc(Long stageId);
}