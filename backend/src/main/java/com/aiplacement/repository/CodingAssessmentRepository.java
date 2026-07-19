package com.aiplacement.repository;

import com.aiplacement.entity.CodingAssessment;
import com.aiplacement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodingAssessmentRepository extends JpaRepository<CodingAssessment, Long> {
    List<CodingAssessment> findByUserOrderByTakenAtDesc(User user);
}
