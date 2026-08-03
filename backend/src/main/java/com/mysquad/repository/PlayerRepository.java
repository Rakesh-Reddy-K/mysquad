package com.mysquad.repository;

import com.mysquad.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {
    List<Player> findByTeamIdOrderByNameAsc(Long teamId);
    Optional<Player> findFirstByUserIdOrderByIdAsc(Long userId);
}
