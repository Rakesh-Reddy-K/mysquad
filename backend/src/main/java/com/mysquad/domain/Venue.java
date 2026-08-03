package com.mysquad.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "venues")
@Getter
@Setter
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(name = "maps_url")
    private String mapsUrl;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "pitch_type", length = 50)
    private String pitchType;

    @Column(nullable = false)
    private boolean parking;

    @Column(name = "average_cost", length = 50)
    private String averageCost;

    @Column(name = "is_favorite", nullable = false)
    private boolean favorite;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}