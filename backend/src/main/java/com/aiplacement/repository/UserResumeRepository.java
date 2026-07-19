package com.aiplacement.repository;

import com.aiplacement.entity.User;
import com.aiplacement.entity.UserResume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserResumeRepository extends JpaRepository<UserResume, Long> {
    List<UserResume> findByUserOrderByLastEditedDesc(User user);
}
