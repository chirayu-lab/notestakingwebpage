/*
  # Create notes table for notes taking application

  1. New Tables
    - `notes`
      - `id` (uuid, primary key) - Unique identifier for each note
      - `title` (text) - Title of the note
      - `content` (text) - Main content of the note
      - `user_id` (uuid) - Reference to the user who owns the note
      - `created_at` (timestamptz) - Timestamp when note was created
      - `updated_at` (timestamptz) - Timestamp when note was last updated

  2. Security
    - Enable RLS on `notes` table
    - Add policy for authenticated users to view their own notes
    - Add policy for authenticated users to insert their own notes
    - Add policy for authenticated users to update their own notes
    - Add policy for authenticated users to delete their own notes
*/

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);