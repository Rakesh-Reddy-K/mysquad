-- ============================================================
-- MySquad — Cricket Team Manager
-- V2: Prevent duplicate player rows per user account
-- ============================================================

-- Clean up any existing duplicates first (keep the lowest id per user)
DELETE FROM players
WHERE id NOT IN (
    SELECT MIN(id)
    FROM players
    WHERE user_id IS NOT NULL
    GROUP BY user_id
)
AND user_id IS NOT NULL;

-- Add a unique constraint so the app can never create a second
-- player row for the same user account again.
CREATE UNIQUE INDEX uk_players_user_id ON players (user_id);