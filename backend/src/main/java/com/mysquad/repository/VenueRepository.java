package com.mysquad.repository;

import com.mysquad.domain.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByTeamIdOrderByIdAsc(Long teamId);
}