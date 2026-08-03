package com.mysquad.controller;

import com.mysquad.domain.Availability;
import com.mysquad.domain.CricketMatch;
import com.mysquad.domain.User;
import com.mysquad.dto.ApiDtos.*;
import com.mysquad.repository.*;
import com.mysquad.service.ApiMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final MatchRepository matchRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final ApiMapper apiMapper;

    @GetMapping
    public DashboardDto dashboard(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("uid");
        Long teamId = userRepository.findById(userId)
                .map(User::getTeamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        CricketMatch upcoming = matchRepository
                .findFirstByStatusOrderByMatchDateAsc("UPCOMING")
                .orElse(null);

        List<Availability> entries = upcoming == null
                ? List.of()
                : availabilityRepository.findByMatchId(upcoming.getId());

        return new DashboardDto(
                upcoming != null ? apiMapper.matchDto(upcoming) : null,
                apiMapper.availabilitySummary(entries),
                announcementRepository.findByTeamIdOrderByCreatedAtDesc(teamId)
                        .stream()
                        .findFirst()
                        .map(a -> apiMapper.announcementDto(a, userRepository.findById(a.getAuthorId()).orElse(null)))
                        .orElse(null),
                new WeatherDto("Partly Cloudy", 28, 64, "cloudy")
        );
    }
}