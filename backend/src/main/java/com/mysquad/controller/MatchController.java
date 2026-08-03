package com.mysquad.controller;

import com.mysquad.domain.Availability;
import com.mysquad.domain.CricketMatch;
import com.mysquad.domain.Player;
import com.mysquad.domain.User;
import com.mysquad.dto.ApiDtos.MatchDto;
import com.mysquad.repository.AvailabilityRepository;
import com.mysquad.repository.MatchRepository;
import com.mysquad.repository.PlayerRepository;
import com.mysquad.repository.UserRepository;
import com.mysquad.service.ApiMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final AvailabilityRepository availabilityRepository;
    private final ApiMapper apiMapper;

    @GetMapping
    public List<MatchDto> allMatches() {
        return apiMapper.matchDtos(matchRepository.findAll());
    }

    @GetMapping("/{id}")
    public MatchDto match(@PathVariable Long id) {
        CricketMatch match = matchRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));
        return apiMapper.matchDto(match);
    }

    /**
     * Captain-only: schedules a new match for the team and opens availability
     * for every active squad member (default PENDING).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MatchDto create(@Validated @RequestBody CreateMatchRequest request, HttpServletRequest servletRequest) {
        User captain = currentUser(servletRequest);
        requireCaptain(captain);

        String groundImage = request.venueId() != null
                ? "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80"
                : null;

        CricketMatch match = new CricketMatch();
        match.setTeamId(captain.getTeamId());
        match.setOpponent(request.opponent());
        match.setVenueId(request.venueId());
        match.setMatchDate(request.date());
        match.setMatchTime(request.time());
        match.setStatus("UPCOMING");
        match.setCaptainNote(request.captainNote());
        match.setGroundImage(groundImage);
        match = matchRepository.save(match);

        // Open availability for the whole squad so players can respond.
        List<Player> squad = playerRepository.findByTeamIdOrderByNameAsc(captain.getTeamId());
        for (Player player : squad) {
            if (!player.isActive()) continue;
            Availability entry = new Availability();
            entry.setMatchId(match.getId());
            entry.setPlayerId(player.getId());
            entry.setStatus("PENDING");
            availabilityRepository.save(entry);
        }

        return apiMapper.matchDto(match);
    }

    /**
     * Captain-only: updates an existing match's details (opponent, date, time,
     * venue, note, status).
     */
    @PutMapping("/{id}")
    public MatchDto update(@PathVariable Long id,
                           @Validated @RequestBody UpdateMatchRequest request,
                           HttpServletRequest servletRequest) {
        User captain = currentUser(servletRequest);
        requireCaptain(captain);

        CricketMatch match = matchRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        if (request.opponent() != null) match.setOpponent(request.opponent());
        if (request.date() != null) match.setMatchDate(request.date());
        if (request.time() != null) match.setMatchTime(request.time());
        if (request.venueId() != null) match.setVenueId(request.venueId());
        if (request.captainNote() != null) match.setCaptainNote(request.captainNote());
        if (request.status() != null) match.setStatus(request.status());

        return apiMapper.matchDto(matchRepository.save(match));
    }

    /**
     * Captain-only: marks a match as Won / Lost / Tied / Abandoned with an
     * optional score and man-of-the-match.
     */
    @PatchMapping("/{id}/result")
    public MatchDto updateResult(@PathVariable Long id,
                                 @Validated @RequestBody UpdateResultRequest request,
                                 HttpServletRequest servletRequest) {
        User captain = currentUser(servletRequest);
        requireCaptain(captain);

        CricketMatch match = matchRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        // A result can only be recorded once the match day has arrived or the
        // match has already been completed. Future matches cannot be "won" or "lost".
        boolean alreadyCompleted = "COMPLETED".equalsIgnoreCase(match.getStatus());
        boolean matchDayReached = !match.getMatchDate().isAfter(LocalDate.now());
        if (!alreadyCompleted && !matchDayReached) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Result can only be recorded after the match has been played");
        }

        match.setResult(request.result());
        match.setScore(request.score());
        match.setMomName(request.mom());
        match.setStatus("COMPLETED");
        return apiMapper.matchDto(matchRepository.save(match));
    }

    /**
     * Captain-only: deletes a match and its associated availability.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable Long id, HttpServletRequest servletRequest) {
        User captain = currentUser(servletRequest);
        requireCaptain(captain);

        CricketMatch match = matchRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        availabilityRepository.deleteByMatchId(match.getId());
        matchRepository.delete(match);
    }

    public record CreateMatchRequest(
            @NotBlank String opponent,
            @NotNull LocalDate date,
            @NotNull LocalTime time,
            Long venueId,
            String captainNote
    ) {}

    public record UpdateMatchRequest(
            String opponent,
            LocalDate date,
            LocalTime time,
            Long venueId,
            String captainNote,
            String status
    ) {}

    public record UpdateResultRequest(
            @NotBlank String result,
            String score,
            String mom
    ) {}

    private User currentUser(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("uid");
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
    }

    private void requireCaptain(User user) {
        if (!user.isCaptain()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the captain can perform this action");
        }
    }
}