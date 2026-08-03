package com.mysquad.service;

import com.mysquad.domain.*;
import com.mysquad.dto.ApiDtos.*;
import com.mysquad.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Converts JPA entities into the DTO contract the React frontend expects.
 */
@Service
@RequiredArgsConstructor
public class ApiMapper {

    private final VenueRepository venueRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;
    private final AttendanceRepository attendanceRepository;
    private final AvailabilityRepository availabilityRepository;

    /* ---------------- Venue ---------------- */

    public VenueDto venueDto(Venue v) {
        return new VenueDto(
                String.valueOf(v.getId()),
                v.getName(),
                v.getLocation(),
                v.getPitchType(),
                v.isParking(),
                v.getMapsUrl(),
                v.getImageUrl(),
                v.isFavorite()
        );
    }

    public List<VenueDto> venueDtos(List<Venue> venues) {
        return venues.stream().map(this::venueDto).toList();
    }

    /* ---------------- Match ---------------- */

    public MatchDto matchDto(CricketMatch m) {
        VenueDto venue = Optional.ofNullable(m.getVenueId())
                .flatMap(venueRepository::findById)
                .map(this::venueDto)
                .orElse(null);

        return new MatchDto(
                String.valueOf(m.getId()),
                m.getOpponent(),
                m.getMatchDate() != null ? m.getMatchDate().toString() : null,
                m.getMatchTime() != null ? m.getMatchTime().toString() : null,
                venue,
                m.getStatus(),
                true,
                m.getResult(),
                m.getScore(),
                m.getMomName(),
                m.getCaptainNote(),
                m.getGroundImage()
        );
    }

    public List<MatchDto> matchDtos(List<CricketMatch> matches) {
        return matches.stream().map(this::matchDto).toList();
    }

    /* ---------------- Player ---------------- */

    public PlayerDto playerDto(Player p) {
        // Role mapping: DB role string -> frontend role label
        String role = switch (p.getRole() == null ? "ALL_ROUNDER" : p.getRole()) {
            case "BATTER" -> "Batsman";
            case "BOWLER" -> "Bowler";
            case "WK" -> "Wicket Keeper";
            default -> "All Rounder";
        };
        String batting = formatBattingStyle(p.getBattingStyle());
        String bowling = formatBowlingStyle(p.getBowlingStyle());

        long played = attendanceRepository.countMatchesByPlayer(p.getId());
        long availability = availabilityRepository.countByPlayerIdAndStatus(p.getId(), "AVAILABLE");
        long totalAvailability = availabilityRepository.countByPlayerId(p.getId());
        int pct = totalAvailability == 0 ? 100 : (int) Math.round(availability * 100.0 / totalAvailability);

        return new PlayerDto(
                String.valueOf(p.getId()),
                p.getName(),
                p.getPhone(),
                null,
                role,
                batting,
                bowling,
                p.isCaptain(),
                null,
                played,
                0,
                0,
                pct
        );
    }

    public List<PlayerDto> playerDtos(List<Player> players) {
        return players.stream().map(this::playerDto).toList();
    }

    public List<PlayerDto> allTeamPlayers(Long teamId) {
        return playerDtos(playerRepository.findByTeamIdOrderByNameAsc(teamId));
    }

    /* ---------------- Availability ---------------- */

    public AvailabilityEntryDto availabilityDto(Availability a, Player player) {
        return new AvailabilityEntryDto(
                String.valueOf(a.getMatchId()),
                String.valueOf(a.getPlayerId()),
                player != null ? player.getName() : "Unknown",
                a.getStatus(),
                a.getRespondedAt() != null ? a.getRespondedAt().toString() : null
        );
    }

    public AvailabilitySummaryDto availabilitySummary(List<Availability> entries) {
        Map<String, Long> counts = entries.stream()
                .collect(Collectors.groupingBy(Availability::getStatus, Collectors.counting()));
        return new AvailabilitySummaryDto(
                counts.getOrDefault("AVAILABLE", 0L),
                counts.getOrDefault("UNAVAILABLE", 0L),
                counts.getOrDefault("PENDING", 0L),
                counts.getOrDefault("MAYBE", 0L)
        );
    }

    /* ---------------- Announcement ---------------- */

    public AnnouncementDto announcementDto(Announcement a, User author) {
        return new AnnouncementDto(
                String.valueOf(a.getId()),
                author != null ? author.getName() : "Captain",
                author != null && author.isCaptain() ? "Captain" : "Player",
                a.getMessage(),
                a.getCreatedAt().toString()
        );
    }

    /* ---------------- Attendance ---------------- */

    public List<AttendanceRecordDto> attendanceRecords(Collection<Player> players) {
        Map<Long, Long> playedMap = attendanceRepository.countPlayedPerPlayer().stream()
                .collect(Collectors.toMap(
                        m -> ((Number) m.get("playerId")).longValue(),
                        m -> ((Number) m.get("played")).longValue()
                ));
        long total = matchRepository.count();

        return players.stream().map(p -> new AttendanceRecordDto(
                String.valueOf(p.getId()),
                p.getName(),
                playedMap.getOrDefault(p.getId(), 0L),
                total
        )).toList();
    }

    /* ---------------- Helpers ---------------- */

    private String formatBattingStyle(String db) {
        if (db == null) return "Right Hand";
        return switch (db) {
            case "LEFT_HAND" -> "Left Hand";
            default -> "Right Hand";
        };
    }

    private String formatBowlingStyle(String db) {
        if (db == null || "NONE".equals(db)) return "None";
        return switch (db) {
            case "FAST" -> "Fast";
            case "SPIN" -> "Spin";
            case "SLOW" -> "Slow";
            default -> "Medium Pace";
        };
    }
}