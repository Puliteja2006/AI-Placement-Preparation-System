package com.aiplacement.repository;

import com.aiplacement.entity.InterviewResult;
import com.aiplacement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewResultRepository extends JpaRepository<InterviewResult, Long> {
    List<InterviewResult> findByUserOrderByCreatedAtDesc(User user);
}
