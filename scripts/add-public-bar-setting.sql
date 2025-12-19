-- Add public_bar_enabled field to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN public_bar_enabled BOOLEAN DEFAULT FALSE;

-- Add comment explaining the field
COMMENT ON COLUMN user_preferences.public_bar_enabled IS 'Whether the user has enabled public access to their bar profile';
