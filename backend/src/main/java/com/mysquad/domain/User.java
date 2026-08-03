package com.mysquad.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String email;

    @Column(length = 50)
    private String role;

    @Column(name = "batting_style", length = 50)
    private String battingStyle;

    @Column(name = "bowling_style", length = 50)
    private String bowlingStyle;

    @Column(name = "is_captain", nullable = false)
    private boolean captain;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "team_id")
    private Long teamId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}