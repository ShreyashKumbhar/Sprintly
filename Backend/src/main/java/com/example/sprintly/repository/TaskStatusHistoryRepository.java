package com.example.sprintly.repository;

import com.example.sprintly.model.TaskStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskStatusHistoryRepository extends JpaRepository<TaskStatusHistory, Long> {

    List<TaskStatusHistory> findByTaskIdOrderByEnteredAtAsc(Long taskId);

    List<TaskStatusHistory> findByTaskIdInOrderByEnteredAtAsc(List<Long> taskIds);

    void deleteByTaskId(Long taskId);
}
