package com.mysquad.controller;

import com.mysquad.domain.Availability;
import com.mysquad.domain.Player;
import com.mysquad.dto.ApiDtos.AvailabilityEntryDto;
import com.mysquad.repository.AvailabilityRepository;
import com.mysquad.repository.PlayerRepository;
import com.mysquad.service.ApiMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityRepository availabilityRepository;
    private final PlayerRepository playerRepository;
    private final ApiMapper apiMapper;

    @GetMapping("/match/{matchId}")
    public List<AvailabilityEntryDto> forMatch(@PathVariable Long matchId) {
        return availabilityRepository.findByMatchId(matchId)
                .stream()
                .map(a -> apiMapper.availabilityDto(a, playerRepository.findById(a.getPlayerId()).orElse(null)))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AvailabilityEntryDto upsert(@RequestBody UpsertRequest request, HttpServletRequest servletRequest) {
        Long userId = (Long) servletRequest.getAttribute("uid");
        Player player = playerRepository.findFirstByUserIdOrderByIdAsc(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Player not found"));

        Availability availability = availabilityRepository
                .findByMatchIdAndPlayerId(request.matchId(), player.getId())
                .orElseGet(Availability::new);

        availability.setMatchId(request.matchId());
        availability.setPlayerId(player.getId());
        availability.setStatus(request.status());
        availability.setRespondedAt(Instant.now());
        return apiMapper.availabilityDto(availabilityRepository.save(availability), player);
    }

    public record UpsertRequest(
            Long matchId,
            String status
    ) {
        public UpsertRequest {
            if (status == null || !status.matches("AVAILABLE|UNAVAILABLE|MAYBE|PENDING")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
            }
        }
    }
}