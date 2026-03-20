-- ============================================================================
-- ENABLE REAL-TIME FOR CHAT TABLES
-- ============================================================================

-- Enable real-time (PostgRES) for messages table
-- This allows Supabase to broadcast INSERT/UPDATE/DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable real-time for conversations (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Enable real-time for conversation_participants (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- Verify the tables are in the publication
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('messages', 'conversations', 'conversation_participants');
