package com.mysquad.controller;

import com.mysquad.domain.Announcement;
import com.mysquad.domain.User;
import com.mysquad.dto.ApiDtos.AnnouncementDto;
import com.mysquad.repository.AnnouncementRepository;
import com.mysquad.repository.UserRepository;
import com.mysquad.service.ApiMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final ApiMapper apiMapper;

    @GetMapping
    public List<AnnouncementDto> announcements(HttpServletRequest request) {
        Long teamId = currentTeamId(request);
        return announcementRepository.findByTeamIdOrderByCreatedAtDesc(teamId)
                .stream()
                .map(a -> apiMapper.announcementDto(a, userRepository.findById(a.getAuthorId()).orElse(null)))
                .toList();
    }

    /**
     * Captain-only: updates an existing announcement's message.
     */
    @PutMapping("/{id}")
    public AnnouncementDto update(@PathVariable Long id,
                                  @RequestBody UpdateRequest body,
                                  HttpServletRequest request) {
        User captain = currentUser(request);
        requireCaptain(captain);

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));

        if (body.message() != null && !body.message().isBlank()) {
            announcement.setMessage(body.message());
        }
        return apiMapper.announcementDto(announcementRepository.save(announcement), captain);
    }

    /**
     * Captain-only: deletes an announcement.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        User captain = currentUser(request);
        requireCaptain(captain);

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));

        announcementRepository.delete(announcement);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnnouncementDto create(@RequestBody CreateRequest body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("uid");
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        Announcement announcement = new Announcement();
        announcement.setTeamId(author.getTeamId());
        announcement.setAuthorId(userId);
        announcement.setMessage(body.message());
        return apiMapper.announcementDto(announcementRepository.save(announcement), author);
    }

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

    private Long currentTeamId(HttpServletRequest request) {
        return currentUser(request).getTeamId();
    }

    public record UpdateRequest(String message) {}

    public record CreateRequest(String message) {
        public CreateRequest {
            if (message == null || message.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
            }
        }
    }
}