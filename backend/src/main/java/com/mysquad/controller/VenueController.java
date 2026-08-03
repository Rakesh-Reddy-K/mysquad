package com.mysquad.controller;

import com.mysquad.domain.User;
import com.mysquad.domain.Venue;
import com.mysquad.dto.ApiDtos.VenueDto;
import com.mysquad.repository.MatchRepository;
import com.mysquad.repository.UserRepository;
import com.mysquad.repository.VenueRepository;
import com.mysquad.service.ApiMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final ApiMapper apiMapper;

    @GetMapping
    public List<VenueDto> venues(HttpServletRequest request) {
        Long teamId = currentTeamId(request);
        return apiMapper.venueDtos(venueRepository.findByTeamIdOrderByIdAsc(teamId));
    }

    /**
     * Captain-only: stores a frequently used ground so it can be picked when
     * scheduling matches.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VenueDto create(@Validated @RequestBody CreateVenueRequest req, HttpServletRequest request) {
        User captain = currentUser(request);
        requireCaptain(captain);

        Venue venue = new Venue();
        venue.setTeamId(captain.getTeamId());
        venue.setName(req.name());
        venue.setLocation(req.location());
        venue.setMapsUrl(req.mapsUrl());
        venue.setImageUrl(req.imageUrl());
        venue.setPitchType(req.pitchType());
        venue.setParking(req.parking() != null && req.parking());
        venue.setFavorite(false);
        venue = venueRepository.save(venue);

        return apiMapper.venueDto(venue);
    }

    /**
     * Captain-only: updates venue details (name, location, maps link, etc.).
     */
    @PutMapping("/{id}")
    public VenueDto update(@PathVariable Long id,
                           @Validated @RequestBody UpdateVenueRequest req,
                           HttpServletRequest request) {
        User captain = currentUser(request);
        requireCaptain(captain);

        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));

        if (req.name() != null) venue.setName(req.name());
        if (req.location() != null) venue.setLocation(req.location());
        if (req.mapsUrl() != null) venue.setMapsUrl(req.mapsUrl());
        if (req.imageUrl() != null) venue.setImageUrl(req.imageUrl());
        if (req.pitchType() != null) venue.setPitchType(req.pitchType());
        if (req.parking() != null) venue.setParking(req.parking());

        return apiMapper.venueDto(venueRepository.save(venue));
    }

    /**
     * Captain-only: deletes a venue from the team's ground list.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        User captain = currentUser(request);
        requireCaptain(captain);

        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));

        long matchCount = matchRepository.countByVenueId(id);
        if (matchCount > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "There is a scheduled match at this ground. Please update or delete that match before removing this venue.");
        }

        venueRepository.delete(venue);
    }

    @PatchMapping("/{id}/favorite")
    public VenueDto toggleFavorite(@PathVariable Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
        venue.setFavorite(!venue.isFavorite());
        return apiMapper.venueDto(venueRepository.save(venue));
    }

    public record CreateVenueRequest(
            @NotBlank String name,
            @NotBlank String location,
            String mapsUrl,
            String imageUrl,
            String pitchType,
            Boolean parking
    ) {}

    public record UpdateVenueRequest(
            String name,
            String location,
            String mapsUrl,
            String imageUrl,
            String pitchType,
            Boolean parking
    ) {}

    private User currentUser(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("uid");
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
    }

    private Long currentTeamId(HttpServletRequest request) {
        return currentUser(request).getTeamId();
    }

    private void requireCaptain(User user) {
        if (!user.isCaptain()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the captain can perform this action");
        }
    }
}