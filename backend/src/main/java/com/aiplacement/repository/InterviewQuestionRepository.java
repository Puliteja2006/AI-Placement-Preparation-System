package com.aiplacement.repository;

import com.aiplacement.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByRoleAndDifficulty(String role, String difficulty);
}
