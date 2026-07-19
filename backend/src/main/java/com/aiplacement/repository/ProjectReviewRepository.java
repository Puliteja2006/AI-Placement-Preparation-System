package com.aiplacement.repository;

import com.aiplacement.entity.ProjectReview;
import com.aiplacement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectReviewRepository extends JpaRepository<ProjectReview, Long> {
    List<ProjectReview> findByUserOrderByReviewedAtDesc(User user);
}
