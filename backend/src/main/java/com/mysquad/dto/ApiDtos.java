package com.mysquad.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Records that mirror the frontend TypeScript contract. */
public final class ApiDtos {

    private ApiDtos() {}

    public record VenueDto(
            String id,
            String name,
            String location,
            String pitchType,
            boolean parking,
            String mapsUrl,
            String imageUrl,
            boolean favorite
    ) {}

    public record MatchDto(
            String id,
            String opponent,
            String date,
            String time,
            VenueDto venue,
            String status,
            boolean isHome,
            String result,
            String score,
            String mom,
            String captainNote,
            String groundImage
    ) {}

    public record PlayerDto(
            String id,
            String name,
            String phone,
            String email,
            String role,
            String battingStyle,
            String bowlingStyle,
            boolean isCaptain,
            String avatarUrl,
            long matches,
            long runs,
            long wickets,
            int availability
    ) {}

    /** Returned when the captain adds a new player. If a login account was
     *  auto-created, {@code defaultPassword} tells the captain what to share. */
    public record CreatePlayerResponse(
            PlayerDto player,
            String defaultPassword
    ) {}

    public record AvailabilityEntryDto(
            String matchId,
            String playerId,
            String playerName,
            String status,
            String respondedAt
    ) {}

    public record AnnouncementDto(
            String id,
            String author,
            String authorRole,
            String message,
            String createdAt
    ) {}

    public record AttendanceRecordDto(
            String playerId,
            String playerName,
            long played,
            long total
    ) {}

    public record DashboardDto(
            MatchDto upcomingMatch,
            AvailabilitySummaryDto availability,
            AnnouncementDto recentAnnouncement,
            WeatherDto weather
    ) {}

    public record AvailabilitySummaryDto(
            long available,
            long unavailable,
            long pending,
            long maybe
    ) {}

    public record WeatherDto(
            String condition,
            int temperature,
            int humidity,
            String icon
    ) {}
}