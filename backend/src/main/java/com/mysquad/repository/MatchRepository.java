package com.mysquad.repository;

import com.mysquad.domain.CricketMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MatchRepository extends JpaRepository<CricketMatch, Long> {
    Optional<CricketMatch> findFirstByStatusOrderByMatchDateAsc(String status);
    long countByVenueId(Long venueId);
}
