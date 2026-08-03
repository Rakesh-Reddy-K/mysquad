package com.mysquad.controller;

import com.mysquad.domain.Player;
import com.mysquad.domain.User;
import com.mysquad.dto.AuthDtos.ChangePasswordRequest;
import com.mysquad.repository.PlayerRepository;
import com.mysquad.repository.UserRepository;
import com.mysquad.service.ApiMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.mysquad.dto.ApiDtos.PlayerDto;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApiMapper apiMapper;

    @GetMapping
    public PlayerDto me(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("uid");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Player player = playerRepository.findFirstByUserIdOrderByIdAsc(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));
        return apiMapper.playerDto(player);
    }

    @PutMapping("/password")
    public void changePassword(
            HttpServletRequest request,
            @Valid @RequestBody ChangePasswordRequest body
    ) {
        Long userId = (Long) request.getAttribute("uid");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(body.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(body.newPassword()));
        userRepository.save(user);
    }
}
