package com.aiplacement.repository;

import com.aiplacement.entity.PlacementPlan;
import com.aiplacement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PlacementPlanRepository extends JpaRepository<PlacementPlan, Long> {
    Optional<PlacementPlan> findFirstByUserOrderByCreatedAtDesc(User user);
}
