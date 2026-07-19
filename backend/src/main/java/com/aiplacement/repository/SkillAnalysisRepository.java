package com.aiplacement.repository;

import com.aiplacement.entity.SkillAnalysis;
import com.aiplacement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SkillAnalysisRepository extends JpaRepository<SkillAnalysis, Long> {
    Optional<SkillAnalysis> findByUser(User user);
}
