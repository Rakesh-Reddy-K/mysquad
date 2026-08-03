package com.mysquad.controller;

import com.mysquad.domain.Player;
import com.mysquad.domain.User;
import com.mysquad.dto.ApiDtos.AttendanceRecordDto;
import com.mysquad.repository.PlayerRepository;
import com.mysquad.repository.UserRepository;
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
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final ApiMapper apiMapper;

    @GetMapping
    public List<AttendanceRecordDto> attendance(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("uid");
        Long teamId = userRepository.findById(userId)
                .map(User::getTeamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        List<Player> teamPlayers = playerRepository.findByTeamIdOrderByNameAsc(teamId);
        return apiMapper.attendanceRecords(teamPlayers);
    }
}