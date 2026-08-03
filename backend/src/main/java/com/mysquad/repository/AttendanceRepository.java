package com.mysquad.repository;

import com.mysquad.domain.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("""
            SELECT NEW map(a.playerId AS playerId, COUNT(a) AS played)
            FROM Attendance a
            WHERE a.status = 'PLAYED'
            GROUP BY a.playerId
            """)
    List<java.util.Map<String, Object>> countPlayedPerPlayer();

    @Query("""
            SELECT COUNT(DISTINCT a.matchId)
            FROM Attendance a
            WHERE a.playerId = :playerId
            """)
    long countMatchesByPlayer(@Param("playerId") Long playerId);
}