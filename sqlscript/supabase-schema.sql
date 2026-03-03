-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  action character varying NOT NULL,
  resource_type character varying,
  resource_id uuid,
  changes jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID PRIMARY KEY UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  photo_url TEXT,
  name VARCHAR(100) NOT NULL,
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
  
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'service', 'followup'
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  icon VARCHAR(50),
  CONSTRAINT service_type_check CHECK (type IN ('service', 'followup'))
);


CREATE TABLE doctor_services (
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (doctor_id, service_id)
);
ALTER TABLE doctor_services
ADD COLUMN fee DECIMAL(10,2) NOT NULL DEFAULT 0;

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
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  appointment_id uuid,
  type character varying DEFAULT 'chat'::character varying,
  is_archived boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
);
CREATE TABLE public.doctor_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  photo_url text,
  title text NOT NULL DEFAULT 'Dr.'::text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  designation text,
  about text,
  specialization text,
  sub_specialization text,
  experience_years integer,
  qualifications ARRAY,
  registration_no text UNIQUE,
  clinic_name text,
  hospital text,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  email text NOT NULL UNIQUE,
  website text,
  languages ARRAY,
  base_fee numeric,
  availability text DEFAULT 'offline'::text CHECK (availability = ANY (ARRAY['online'::text, 'busy'::text, 'offline'::text, 'by-appointment'::text])),
  member_since date,
  patients_served integer DEFAULT 0,
  rating numeric CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  clinic_photo_urls ARRAY DEFAULT '{}'::text[],
  CONSTRAINT doctor_profiles_pkey PRIMARY KEY (id, user_id),
  CONSTRAINT doctor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

ALTER TABLE appointments
DROP CONSTRAINT appointments_service_id_fkey;

ALTER TABLE appointments
ADD CONSTRAINT appointments_service_id_fkey
FOREIGN KEY (doctor_id, service_id)
REFERENCES doctor_services(doctor_id, service_id)
ON DELETE RESTRICT;

ALTER TABLE appointments
ADD COLUMN booked_fee DECIMAL(10,2) NOT NULL;

ALTER TABLE appointments
ADD CONSTRAINT unique_doctor_time_slot
UNIQUE (doctor_id, appointment_date, start_time);

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
CREATE TABLE public.follow_ups (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  appointment_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time without time zone,
  follow_up_type character varying,
  notes text,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'overdue'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT follow_ups_pkey PRIMARY KEY (id),
  CONSTRAINT follow_ups_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT follow_ups_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(user_id),
  CONSTRAINT follow_ups_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(user_id)
);
CREATE TABLE public.medical_documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  document_type character varying,
  title character varying,
  description text,
  file_url text NOT NULL,
  file_name character varying,
  file_size integer,
  mime_type character varying,
  uploaded_by_doctor_id uuid,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT medical_documents_pkey PRIMARY KEY (id),
  CONSTRAINT medical_documents_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(user_id),
  CONSTRAINT medical_documents_uploaded_by_doctor_id_fkey FOREIGN KEY (uploaded_by_doctor_id) REFERENCES public.doctor_profiles(user_id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  type character varying DEFAULT 'text'::character varying CHECK (type::text = ANY (ARRAY['text'::character varying, 'image'::character varying, 'audio'::character varying, 'file'::character varying, 'video'::character varying, 'document'::character varying]::text[])),
  media_url text,
  file_name character varying,
  file_size integer,
  status character varying DEFAULT 'sent'::character varying,
  edited_at timestamp with time zone,
  reacts ARRAY DEFAULT ARRAY[]::text[],
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['appointment'::character varying, 'payment'::character varying, 'message'::character varying, 'call'::character varying, 'system'::character varying, 'followup'::character varying]::text[])),
  title character varying NOT NULL,
  message text,
  related_id uuid,
  related_type character varying,
  read boolean DEFAULT false,
  read_at timestamp with time zone,
  action_url text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  razorpay_order_id text NOT NULL UNIQUE,
  razorpay_payment_id text UNIQUE,
  amount integer NOT NULL,
  currency text DEFAULT 'INR'::text,
  status text DEFAULT 'created'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.patient_profiles (
  id uuid DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  photo_url text,
  name text NOT NULL,
  date_of_birth date,
  gender character varying,
  blood_group character varying,
  allergies ARRAY DEFAULT ARRAY[]::text[],
  phone character varying,
  email character varying,
  medical_conditions ARRAY DEFAULT ARRAY[]::text[],
  medications ARRAY DEFAULT ARRAY[]::text[],
  emergency_contact_name character varying,
  emergency_contact_phone character varying,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  address text,
  city character varying,
  state character varying,
  zip character varying,
  CONSTRAINT patient_profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT patient_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  appointment_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency character varying DEFAULT 'INR'::character varying,
  payment_method character varying,
  transaction_id character varying UNIQUE,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying]::text[])),
  notes text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT payments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(user_id),
  CONSTRAINT payments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(user_id)
);
CREATE TABLE public.prescriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  appointment_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  medicines jsonb,
  notes text,
  document_url text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
  CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(user_id),
  CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(user_id),
  CONSTRAINT prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  appointment_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title character varying,
  content text,
  is_verified_appointment boolean DEFAULT true,
  helpful_count integer DEFAULT 0,
  unhelpful_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT reviews_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(user_id),
  CONSTRAINT reviews_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(user_id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['service'::character varying, 'followup'::character varying]::text[])),
  description text,
  price numeric NOT NULL,
  duration_minutes integer DEFAULT 30,
  icon character varying,
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  subject character varying NOT NULL,
  description text,
  category character varying,
  status character varying DEFAULT 'open'::character varying,
  priority character varying DEFAULT 'medium'::character varying,
  assigned_to uuid,
  resolution_notes text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  resolved_at timestamp with time zone,
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id)
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
ALTER TABLE doctor_services ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Doctors manage own services" ON doctor_services
  FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

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

-- ============================================================================
-- VIDEO ROOMS (for VideoSDK meeting integration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '4 hours'),
  CONSTRAINT unique_appointment_room UNIQUE (appointment_id)
);

CREATE INDEX idx_video_rooms_appointment ON video_rooms(appointment_id);
