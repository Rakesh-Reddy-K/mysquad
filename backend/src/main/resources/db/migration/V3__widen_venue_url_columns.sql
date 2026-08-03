-- V3: Widen venue URL columns to accommodate long Google Maps links
ALTER TABLE venues ALTER COLUMN maps_url TYPE TEXT;
ALTER TABLE venues ALTER COLUMN image_url TYPE TEXT;