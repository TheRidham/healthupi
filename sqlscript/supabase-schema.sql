-- ============================================================================
-- HEALTHUPI DATABASE SCHEMA
-- Complete Supabase schema for healthcare telemedicine platform
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS & PROFILES
-- ============================================================================

-- Doctor Profiles
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  photo_url TEXT,
  title VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  designation VARCHAR(100),
  about TEXT,
  
  -- Professional
  specialization VARCHAR(100),
  sub_specialization VARCHAR(100),
  experience_years INTEGER,
  qualifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  registration_no VARCHAR(100) UNIQUE,
  
  -- Clinic Info
  clinic_name VARCHAR(200),
  hospital VARCHAR(200),
  address VARCHAR(300),
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20),
  
  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Services & Pricing
  base_fee DECIMAL(10, 2),
  availability VARCHAR(20) DEFAULT 'offline', -- online, offline, partially available
  
  -- Additional Info
  member_since DATE,
  patients_served INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  clinic_photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID PRIMARY KEY UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  photo_url TEXT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Medical History
  medical_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
  medications TEXT[] DEFAULT ARRAY[]::TEXT[],
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. SERVICES & PRICING
-- ============================================================================

-- Services (consultation types offered by doctor)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'service', 'followup'
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  icon VARCHAR(50),
  
  enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT service_type_check CHECK (type IN ('service', 'followup'))
);

-- ============================================================================
-- 3. AVAILABILITY & TIME SLOTS
-- ============================================================================

-- Time Slots (recurring availability)
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
  
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  appointment_duration INTEGER DEFAULT 30, -- in minutes
  
  is_available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blocked Dates (vacation, holidays, special unavailability)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
  
  blocked_date DATE NOT NULL,
  reason VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id, blocked_date)
);

-- ============================================================================
-- 4. APPOINTMENTS & BOOKINGS
-- ============================================================================

-- Appointments/Bookings
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient_profiles(user_id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no-show
  cancellation_reason TEXT,
  cancelled_by VARCHAR(20), -- 'doctor', 'patient', 'system'
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT status_check CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show'))
);

-- ============================================================================
-- 5. PAYMENTS
-- ============================================================================

-- Payments/Transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id),
  patient_id UUID NOT NULL REFERENCES patient_profiles(user_id),
  
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  payment_method VARCHAR(50), -- 'card', 'upi', 'wallet', 'bank_transfer'
  transaction_id VARCHAR(255) UNIQUE,
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT payment_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- ============================================================================
-- 6. COMMUNICATIONS - CHAT & CONVERSATIONS
-- ============================================================================

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  type VARCHAR(50) DEFAULT 'chat', -- 'chat', 'video', 'audio', 'group'
  
  is_archived BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversation Participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member', 'doctor', 'patient'
  
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'audio', 'file', 'video'
  
  media_url TEXT, -- for images, audio, files, video
  file_name VARCHAR(255),
  file_size INTEGER,
  
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read'
  
  edited_at TIMESTAMP WITH TIME ZONE,
  reacts TEXT[] DEFAULT ARRAY[]::TEXT[], -- emoji reactions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT message_type_check CHECK (type IN ('text', 'image', 'audio', 'file', 'video', 'document'))
);

-- ============================================================================
-- 7. VIDEO CALLS & SESSIONS
-- ============================================================================

-- Video Calls
CREATE TABLE IF NOT EXISTS video_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id),
  patient_id UUID NOT NULL REFERENCES patient_profiles(user_id),
  
  room_id VARCHAR(255) UNIQUE,
  
  status VARCHAR(50) DEFAULT 'initiated', -- initiated, ringing, active, ended, missed
  
  duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT call_status_check CHECK (status IN ('initiated', 'ringing', 'active', 'ended', 'missed', 'rejected'))
);

-- ============================================================================
-- 8. FOLLOW-UPS
-- ============================================================================

-- Follow-ups
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id),
  patient_id UUID NOT NULL REFERENCES patient_profiles(user_id),
  
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  
  follow_up_type VARCHAR(50), -- 'video', 'chat', 'in-person'
  notes TEXT,
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled, overdue
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT followup_status_check CHECK (status IN ('pending', 'completed', 'cancelled', 'overdue'))
);

-- ============================================================================
-- 9. REVIEWS & RATINGS
-- ============================================================================

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient_profiles(user_id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL, -- 1-5
  title VARCHAR(255),
  content TEXT,
  
  is_verified_appointment BOOLEAN DEFAULT true,
  
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- ============================================================================
-- 10. NOTIFICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, -- 'appointment', 'payment', 'message', 'call', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  related_id UUID, -- appointment_id, payment_id, conversation_id, etc.
  related_type VARCHAR(50), -- what type of entity is related_id
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  action_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT notification_type_check CHECK (type IN ('appointment', 'payment', 'message', 'call', 'system', 'followup'))
);

-- ============================================================================
-- 11. PRESCRIPTIONS & MEDICAL DOCUMENTS
-- ============================================================================

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id),
  patient_id UUID NOT NULL REFERENCES patient_profiles(user_id),
  
  medicines JSONB, -- Array of {name, dosage, frequency, duration, notes}
  
  notes TEXT,
  document_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical Documents
CREATE TABLE IF NOT EXISTS medical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(user_id) ON DELETE CASCADE,
  
  document_type VARCHAR(100), -- 'prescription', 'report', 'certificate', 'x-ray', etc.
  title VARCHAR(255),
  description TEXT,
  
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  uploaded_by_doctor_id UUID REFERENCES doctor_profiles(user_id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. ADMIN & SYSTEM
-- ============================================================================

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  
  status VARCHAR(50) DEFAULT 'open', -- open, in-progress, resolved, closed
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
  
  assigned_to UUID REFERENCES auth.users(id),
  
  resolution_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  
  changes JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Doctor Profiles
CREATE INDEX idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX idx_doctor_profiles_city ON doctor_profiles(city);
CREATE INDEX idx_doctor_profiles_specialization ON doctor_profiles(specialization);
CREATE INDEX idx_doctor_profiles_rating ON doctor_profiles(rating DESC);

-- Patient Profiles
CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);

-- Services
CREATE INDEX idx_services_doctor_id ON services(doctor_id);
CREATE INDEX idx_services_enabled ON services(enabled);

-- Time Slots
CREATE INDEX idx_time_slots_doctor_id ON time_slots(doctor_id);
CREATE INDEX idx_time_slots_day ON time_slots(day_of_week);

-- Appointments
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);

-- Payments
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_doctor_id ON payments(doctor_id);
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Conversations
CREATE INDEX idx_conversations_appointment_id ON conversations(appointment_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Video Calls
CREATE INDEX idx_video_calls_appointment_id ON video_calls(appointment_id);
CREATE INDEX idx_video_calls_doctor_id ON video_calls(doctor_id);
CREATE INDEX idx_video_calls_patient_id ON video_calls(patient_id);
CREATE INDEX idx_video_calls_status ON video_calls(status);

-- Follow-ups
CREATE INDEX idx_follow_ups_appointment_id ON follow_ups(appointment_id);
CREATE INDEX idx_follow_ups_doctor_id ON follow_ups(doctor_id);
CREATE INDEX idx_follow_ups_patient_id ON follow_ups(patient_id);
CREATE INDEX idx_follow_ups_status ON follow_ups(status);

-- Reviews
CREATE INDEX idx_reviews_doctor_id ON reviews(doctor_id);
CREATE INDEX idx_reviews_patient_id ON reviews(patient_id);
CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Support Tickets
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Doctor Profiles - Users can view public profiles, edit their own
CREATE POLICY "Public profiles visible" ON doctor_profiles
  FOR SELECT USING (true);

CREATE POLICY "Doctors can edit own profile" ON doctor_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can insert own profile" ON doctor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Patient Profiles - Users can edit their own, doctors can view related
CREATE POLICY "Patients can edit own profile" ON patient_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can insert own profile" ON patient_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can view own profile" ON patient_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Services - Public read, doctors can manage their own
CREATE POLICY "Services are public" ON services
  FOR SELECT USING (true);

CREATE POLICY "Doctors manage own services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles 
      WHERE doctor_profiles.id = services.doctor_id 
      AND doctor_profiles.user_id = auth.uid()
    )
  );

-- Appointments - Users can see their own, related doctors can see theirs
CREATE POLICY "Users can see own appointments" ON appointments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT patient_id FROM patient_profiles WHERE patient_id = appointments.patient_id
      UNION
      SELECT user_id FROM doctor_profiles WHERE doctor_profiles.id = appointments.doctor_id
    )
  );

-- Messages - Users in conversation can see/send
CREATE POLICY "Users can see messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Notifications - Users can see their own
CREATE POLICY "Users can see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_calls_updated_at BEFORE UPDATE ON video_calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON follow_ups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_documents_updated_at BEFORE UPDATE ON medical_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
