package com.mysquad.controller;

import com.mysquad.domain.Player;
import com.mysquad.domain.User;
import com.mysquad.dto.AuthDtos.*;
import com.mysquad.repository.PlayerRepository;
import com.mysquad.repository.UserRepository;
import com.mysquad.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByPhone(request.phone())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId(), user.getPhone());
        return ResponseEntity.ok(toResponse(user, token));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already registered");
        }

        User user = new User();
        user.setPhone(request.phone());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        user.setRole("ALL_ROUNDER");
        user.setTeamId(1L); // MVP: demo team "Strikers XI"
        user = userRepository.save(user);

        // Create a linked squad player row so the new user appears in
        // availability and attendance.
        Player player = new Player();
        player.setTeamId(1L);
        player.setUserId(user.getId());
        player.setName(user.getName());
        player.setPhone(user.getPhone());
        player.setRole("ALL_ROUNDER");
        player.setBattingStyle("RIGHT_HAND");
        player.setBowlingStyle("NONE");
        player.setCaptain(false);
        playerRepository.save(player);

        String token = jwtService.generateToken(user.getId(), user.getPhone());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user, token));
    }

    private AuthResponse toResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getRole(),
                user.isCaptain()
        );
    }
}