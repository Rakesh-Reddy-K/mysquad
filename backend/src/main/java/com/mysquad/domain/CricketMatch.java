package com.mysquad.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "matches")
@Getter
@Setter
public class CricketMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(nullable = false, length = 100)
    private String opponent;

    @Column(name = "venue_id")
    private Long venueId;

    @Column(name = "match_date", nullable = false)
    private LocalDate matchDate;

    @Column(name = "match_time", nullable = false)
    private LocalTime matchTime;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 20)
    private String result;

    @Column(length = 100)
    private String score;

    @Column(name = "mom_name", length = 100)
    private String momName;

    @Column(name = "captain_note")
    private String captainNote;

    @Column(name = "ground_image", length = 500)
    private String groundImage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}