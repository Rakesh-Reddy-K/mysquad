package com.mysquad.repository;

import com.mysquad.domain.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByMatchId(Long matchId);

    java.util.Optional<Availability> findByMatchIdAndPlayerId(Long matchId, Long playerId);

    @Query("""
            SELECT NEW map(a.status AS status, COUNT(a) AS count)
            FROM Availability a
            GROUP BY a.status
            """)
    List<Map<String, Object>> summarizeByStatus();

    boolean existsByMatchIdAndPlayerId(Long matchId, Long playerId);

    long countByPlayerId(Long playerId);

    long countByPlayerIdAndStatus(Long playerId, String status);

    @Modifying
    @Transactional
    void deleteByMatchId(Long matchId);
}
