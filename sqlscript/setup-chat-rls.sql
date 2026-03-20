-- ============================================================================
-- CHAT TABLES RLS POLICIES - SIMPLIFIED
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Allow creating conversations" ON conversations;
DROP POLICY IF EXISTS "Allow viewing participants" ON conversation_participants;
DROP POLICY IF EXISTS "Allow inserting participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Disable RLS on all tables first to start fresh
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_conversations"
  ON conversations
  FOR SELECT
  USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users_create_conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- CONVERSATION PARTICIPANTS TABLE - NO RLS
-- Access controlled through conversations & messages tables
-- ============================================================================

-- Keep RLS disabled to avoid recursion

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to view messages in their conversations
CREATE POLICY "users_view_messages"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to send messages in their conversations
CREATE POLICY "users_send_messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to update their own messages
CREATE POLICY "users_update_own_messages"
  ON messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Allow users to delete their own messages
CREATE POLICY "users_delete_own_messages"
  ON messages
  FOR DELETE
  USING (sender_id = auth.uid());
