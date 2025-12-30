-- RLS Policy to allow users to delete their own artworks
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS (just in case)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy for DELETE
-- "Users can delete their own artworks"
CREATE POLICY "Users can delete own artworks"
ON artworks
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Verify Policies (Optional)
SELECT * FROM pg_policies WHERE tablename = 'artworks';
