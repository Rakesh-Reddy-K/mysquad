package com.mysquad.repository;

import com.mysquad.domain.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findTop3ByOrderByCreatedAtDesc();
    List<Announcement> findByTeamIdOrderByCreatedAtDesc(Long teamId);
}
