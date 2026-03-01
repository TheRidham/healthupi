-- Check what's in time_slots
SELECT * FROM public.time_slots LIMIT 5;

-- Drop the constraint if it exists (fixes schema issue)
ALTER TABLE public.time_slots DROP CONSTRAINT IF EXISTS unique_doctor_time_slot;

-- Now clear and re-add
DELETE FROM public.time_slots WHERE doctor_id IN (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011',
  '281e38c8-0aec-453a-b475-0d252050e47d',
  '0c005620-bb41-4913-ba2f-c9f3b00b03fc'
);

-- Add time slots
INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, appointment_duration, is_available)
VALUES 
('00000000-0000-0000-0000-000000000010', 1, '09:00:00', '12:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 1, '14:00:00', '18:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 2, '09:00:00', '12:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 2, '14:00:00', '18:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 3, '09:00:00', '12:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 3, '14:00:00', '18:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 4, '09:00:00', '12:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 4, '14:00:00', '18:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 5, '09:00:00', '12:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 5, '14:00:00', '18:00:00', 30, true),
('00000000-0000-0000-0000-000000000010', 6, '10:00:00', '14:00:00', 30, true);

SELECT 'Time slots added:' as info, COUNT(*) as count FROM public.time_slots;
