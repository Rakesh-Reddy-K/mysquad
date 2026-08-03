package com.mysquad.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "players")
@Getter
@Setter
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 15)
    private String phone;

    @Column(nullable = false, length = 50)
    private String role;

    @Column(name = "batting_style", length = 50)
    private String battingStyle;

    @Column(name = "bowling_style", length = 50)
    private String bowlingStyle;

    @Column(name = "is_captain", nullable = false)
    private boolean captain;

    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}