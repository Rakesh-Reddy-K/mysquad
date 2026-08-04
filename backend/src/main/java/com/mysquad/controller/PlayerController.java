package com.mysquad.controller;

import com.mysquad.domain.Player;
import com.mysquad.domain.User;
import com.mysquad.dto.ApiDtos.CreatePlayerResponse;
import com.mysquad.dto.ApiDtos.PlayerDto;
import com.mysquad.repository.PlayerRepository;
import com.mysquad.repository.UserRepository;
import com.mysquad.service.ApiMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApiMapper apiMapper;

    @GetMapping
    public List<PlayerDto> players(HttpServletRequest request) {
        Long teamId = currentTeamId(request);
        return apiMapper.allTeamPlayers(teamId);
    }

    /**
     * Captain-only: adds a new teammate to the squad roster. The player can be
     * a registered user (userId) or a walk-on with just a name/phone.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreatePlayerResponse create(@Validated @RequestBody CreatePlayerRequest req, HttpServletRequest request) {
        User captain = currentUser(request);
        requireCaptain(captain);

        // If the phone belongs to a registered user, link the new player row to
        // that account. If not, auto-create a login account so the player can
        // sign in using their phone as username and a default password.
        Long linkedUserId = null;
        String defaultPassword = null;
        if (req.phone() != null && !req.phone().isBlank()) {
            User existing = userRepository.findByPhone(req.phone()).orElse(null);
            if (existing != null) {
                linkedUserId = existing.getId();
            } else {
                defaultPassword = "mysquad123";
                User newUser = new User();
                newUser.setPhone(req.phone());
                newUser.setPasswordHash(passwordEncoder.encode(defaultPassword));
                newUser.setName(req.name());
                newUser.setRole(req.role() != null ? req.role() : "ALL_ROUNDER");
                newUser.setCaptain(false);
                newUser.setTeamId(captain.getTeamId());
                newUser = userRepository.save(newUser);
                linkedUserId = newUser.getId();
            }
        }

        Player player = new Player();
        player.setTeamId(captain.getTeamId());
        player.setUserId(linkedUserId);
        player.setName(req.name());
        player.setPhone(req.phone());
        player.setRole(req.role() != null ? req.role() : "ALL_ROUNDER");
        player.setBattingStyle(req.battingStyle());
        player.setBowlingStyle(req.bowlingStyle());
        player.setCaptain(false);
        player.setJerseyNumber(req.jerseyNumber());
        player.setActive(true);
        player = playerRepository.save(player);

        PlayerDto dto = apiMapper.playerDto(player);
        // Tell the captain the default password for the newly created account.
        return new CreatePlayerResponse(dto, defaultPassword);
    }

    /**
     * Captain-only: updates a player's details.
     */
    @PutMapping("/{id}")
    public PlayerDto update(@PathVariable Long id,
                            @RequestBody UpdatePlayerRequest req,
                            HttpServletRequest request) {
        User captain = currentUser(request);
        requireCaptain(captain);

        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));

        if (req.name() != null) player.setName(req.name());
        if (req.role() != null) player.setRole(req.role());
        if (req.battingStyle() != null) player.setBattingStyle(req.battingStyle());
        if (req.bowlingStyle() != null) player.setBowlingStyle(req.bowlingStyle());
        if (req.jerseyNumber() != null) player.setJerseyNumber(req.jerseyNumber());
        if (req.phone() != null) player.setPhone(req.phone());

        return apiMapper.playerDto(playerRepository.save(player));
    }

    /**
     * Captain-only: removes a player from the squad.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        User captain = currentUser(request);
        requireCaptain(captain);

        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));
        playerRepository.delete(player);
    }

    public record CreatePlayerRequest(
            @NotBlank String name,
            @NotBlank(message = "Mobile number is required")
            @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Valid 10-digit mobile number required")
            String phone,
            String role,
            String battingStyle,
            String bowlingStyle,
            Integer jerseyNumber
    ) {}

    public record UpdatePlayerRequest(
            String name,
            @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Valid 10-digit mobile number required")
            String phone,
            String role,
            String battingStyle,
            String bowlingStyle,
            Integer jerseyNumber
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