-- ============================================================
-- MySquad — Cricket Team Manager (MVP)
-- V1: Initial schema
-- ============================================================

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    phone           VARCHAR(15)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    role            VARCHAR(50)  NOT NULL DEFAULT 'PLAYER',  -- BATTER | BOWLER | ALL_ROUNDER | WK
    batting_style   VARCHAR(50),                               -- RIGHT_HAND | LEFT_HAND
    bowling_style   VARCHAR(50),                               -- MEDIUM_PACE | SPIN | etc.
    is_captain      BOOLEAN      NOT NULL DEFAULT FALSE,
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    logo_url    VARCHAR(500),
    captain_id  BIGINT REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN team_id BIGINT REFERENCES teams(id);

CREATE TABLE players (
    id              BIGSERIAL PRIMARY KEY,
    team_id         BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id         BIGINT REFERENCES users(id),
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(15),
    role            VARCHAR(50) NOT NULL DEFAULT 'ALL_ROUNDER',
    batting_style   VARCHAR(50),
    bowling_style   VARCHAR(50),
    is_captain      BOOLEAN NOT NULL DEFAULT FALSE,
    jersey_number   INT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE venues (
    id            BIGSERIAL PRIMARY KEY,
    team_id       BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name          VARCHAR(150) NOT NULL,
    location      VARCHAR(255) NOT NULL,
    maps_url      VARCHAR(500),
    image_url     VARCHAR(500),
    pitch_type    VARCHAR(50),
    parking       BOOLEAN NOT NULL DEFAULT FALSE,
    average_cost  VARCHAR(50),
    is_favorite   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE matches (
    id             BIGSERIAL PRIMARY KEY,
    team_id        BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    opponent       VARCHAR(100) NOT NULL,
    venue_id       BIGINT REFERENCES venues(id),
    match_date     DATE NOT NULL,
    match_time     TIME NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',  -- UPCOMING | COMPLETED | CANCELLED
    result         VARCHAR(20),                               -- WON | LOST | TIE
    score          VARCHAR(100),
    mom_name       VARCHAR(100),
    captain_note   TEXT,
    ground_image   VARCHAR(500),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE availability (
    id            BIGSERIAL PRIMARY KEY,
    match_id      BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id     BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- AVAILABLE | UNAVAILABLE | MAYBE | PENDING
    responded_at  TIMESTAMP,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (match_id, player_id)
);

CREATE TABLE announcements (
    id          BIGSERIAL PRIMARY KEY,
    team_id     BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    author_id   BIGINT NOT NULL REFERENCES users(id),
    message     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE match_photos (
    id          BIGSERIAL PRIMARY KEY,
    match_id    BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    photo_url   VARCHAR(500) NOT NULL,
    uploaded_by BIGINT REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE attendance (
    id            BIGSERIAL PRIMARY KEY,
    match_id      BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id     BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    status        VARCHAR(20) NOT NULL,  -- PLAYED | MISSED
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (match_id, player_id)
);

-- ============================================================
-- Seed data
-- ============================================================

-- Demo team + captain
INSERT INTO users (id, phone, password_hash, name, email, role, batting_style, bowling_style, is_captain)
VALUES
    (1, '9876543210', '$2b$10$ETCzQXx3RTMRpy.qZmekMOndAH7tcbbpBtSUvSLgsIzgP6qxG8oTq', 'Rakesh', 'rakesh@mysquad.app', 'ALL_ROUNDER', 'RIGHT_HAND', 'MEDIUM_PACE', TRUE),
    (2, '9876543211', '$2b$10$ETCzQXx3RTMRpy.qZmekMOndAH7tcbbpBtSUvSLgsIzgP6qxG8oTq', 'Rahul',  'rahul@mysquad.app',  'BATTER',       'RIGHT_HAND', 'NONE',         FALSE),
    (3, '9876543212', '$2b$10$ETCzQXx3RTMRpy.qZmekMOndAH7tcbbpBtSUvSLgsIzgP6qxG8oTq', 'Nani',   'nani@mysquad.app',   'BOWLER',       'LEFT_HAND',  'MEDIUM_PACE',  FALSE);

INSERT INTO teams (id, name, logo_url, captain_id)
VALUES (1, 'Strikers XI', NULL, 1);

UPDATE users SET team_id = 1 WHERE id IN (1, 2, 3);

INSERT INTO players (id, team_id, user_id, name, phone, role, batting_style, bowling_style, is_captain)
VALUES
    (1, 1, 1, 'Rakesh', '9876543210', 'ALL_ROUNDER', 'RIGHT_HAND', 'MEDIUM_PACE', TRUE),
    (2, 1, 2, 'Rahul',  '9876543211', 'BATTER',       'RIGHT_HAND', 'NONE',        FALSE),
    (3, 1, 3, 'Nani',   '9876543212', 'BOWLER',       'LEFT_HAND',  'MEDIUM_PACE',  FALSE),
    (4, 1, NULL, 'Suresh', NULL, 'BATTER', 'RIGHT_HAND', 'NONE', FALSE),
    (5, 1, NULL, 'Kiran',  NULL, 'BOWLER', 'RIGHT_HAND', 'SPIN', FALSE);

INSERT INTO venues (id, team_id, name, location, maps_url, image_url, pitch_type, parking, average_cost)
VALUES
    (1, 1, 'LB Stadium', 'Lal Bahadur Shastri Stadium, Hyderabad',
     'https://maps.google.com/?q=LB+Stadium+Hyderabad',
     'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
     'Grass', TRUE, '₹200/player'),
    (2, 1, 'NFC Ground', 'NFC Ground, Gachibowli, Hyderabad',
     'https://maps.google.com/?q=NFC+Ground+Hyderabad',
     'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
     'Artificial', TRUE, '₹150/player');

INSERT INTO matches (id, team_id, opponent, venue_id, match_date, match_time, status, result, captain_note, ground_image)
VALUES
    (1, 1, 'Titans XI', 1, '2026-08-01', '07:00', 'UPCOMING', NULL,
     'Please wear white jerseys. Report by 6:15 AM sharp! Bring your own water bottle.',
     'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80'),
    (2, 1, 'Rising Stars', 2, '2026-08-08', '06:30', 'UPCOMING', NULL,
     NULL, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80'),
    (3, 1, 'Warriors XI', 1, '2026-07-19', '07:00', 'COMPLETED', 'WON',
     'Won by 4 wickets! Great fielding display.',
     'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80');

INSERT INTO availability (match_id, player_id, status, responded_at)
VALUES
    (1, 1, 'AVAILABLE',   '2026-07-30 10:00:00'),
    (1, 2, 'AVAILABLE',   '2026-07-30 10:05:00'),
    (1, 3, 'MAYBE',       '2026-07-30 11:00:00'),
    (1, 4, 'PENDING',     NULL),
    (1, 5, 'UNAVAILABLE', '2026-07-29 18:00:00');

INSERT INTO announcements (id, team_id, author_id, message, created_at)
VALUES
    (1, 1, 1, 'Team, please be on time for the match. Report by 6:15 AM 🏏', '2026-07-30 09:00:00');

INSERT INTO attendance (match_id, player_id, status)
VALUES
    (3, 1, 'PLAYED'),
    (3, 2, 'PLAYED'),
    (3, 3, 'PLAYED'),
    (3, 4, 'MISSED');

-- ============================================================
-- Advance sequences past the seeded IDs so that newly created
-- rows (player registration, match scheduling, announcements,
-- venues) do not collide with the demo data.
-- ============================================================
SELECT setval('users_id_seq', 3);
SELECT setval('teams_id_seq', 1);
SELECT setval('players_id_seq', 5);
SELECT setval('venues_id_seq', 2);
SELECT setval('matches_id_seq', 3);
SELECT setval('announcements_id_seq', 1);
