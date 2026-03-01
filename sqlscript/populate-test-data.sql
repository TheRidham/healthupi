-- ============================================================================
-- HealthUPI Test Data Population Script
-- ============================================================================

-- 1. ADD DOCTOR SERVICES FOR RAVI TOMAR
INSERT INTO public.doctor_services (doctor_id, service_id, enabled, created_at, updated_at, fee)
SELECT '0c005620-bb41-4913-ba2f-c9f3b00b03fc', '00000000-0000-0000-0000-000000000001', true, NOW(), NOW(), 660.00
WHERE NOT EXISTS (SELECT 1 FROM public.doctor_services WHERE doctor_id = '0c005620-bb41-4913-ba2f-c9f3b00b03fc' AND service_id = '00000000-0000-0000-0000-000000000001');

INSERT INTO public.doctor_services (doctor_id, service_id, enabled, created_at, updated_at, fee)
SELECT '0c005620-bb41-4913-ba2f-c9f3b00b03fc', '00000000-0000-0000-0000-000000000002', true, NOW(), NOW(), 400.00
WHERE NOT EXISTS (SELECT 1 FROM public.doctor_services WHERE doctor_id = '0c005620-bb41-4913-ba2f-c9f3b00b03fc' AND service_id = '00000000-0000-0000-0000-000000000002');

INSERT INTO public.doctor_services (doctor_id, service_id, enabled, created_at, updated_at, fee)
SELECT '0c005620-bb41-4913-ba2f-c9f3b00b03fc', '00000000-0000-0000-0000-000000000003', true, NOW(), NOW(), 1800.00
WHERE NOT EXISTS (SELECT 1 FROM public.doctor_services WHERE doctor_id = '0c005620-bb41-4913-ba2f-c9f3b00b03fc' AND service_id = '00000000-0000-0000-0000-000000000003');

INSERT INTO public.doctor_services (doctor_id, service_id, enabled, created_at, updated_at, fee)
SELECT '0c005620-bb41-4913-ba2f-c9f3b00b03fc', '00000000-0000-0000-0000-000000000006', true, NOW(), NOW(), 250.00
WHERE NOT EXISTS (SELECT 1 FROM public.doctor_services WHERE doctor_id = '0c005620-bb41-4913-ba2f-c9f3b00b03fc' AND service_id = '00000000-0000-0000-0000-000000000006');

-- 2. DELETE ALL TIME SLOTS FOR DOCTORS
DELETE FROM public.time_slots WHERE doctor_id = '00000000-0000-0000-0000-000000000010';
DELETE FROM public.time_slots WHERE doctor_id = '00000000-0000-0000-0000-000000000011';
DELETE FROM public.time_slots WHERE doctor_id = '281e38c8-0aec-453a-b475-0d252050e47d';
DELETE FROM public.time_slots WHERE doctor_id = '0c005620-bb41-4913-ba2f-c9f3b00b03fc';

-- 3. ADD TIME SLOTS (using TRUNCATE style - delete & insert)
INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, appointment_duration, is_available)
VALUES 
-- Rahul Sharma
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

-- 4. DELETE OLD TEST APPOINTMENTS (specific IDs)
DELETE FROM public.appointments WHERE id IN (
  'a1b2c3d4-1111-1111-1111-111111111111',
  'a1b2c3d4-2222-2222-2222-222222222222',
  'a1b2c3d4-3333-3333-3333-333333333333',
  'a1b2c3d4-4444-4444-4444-444444444444',
  'a1b2c3d4-5555-5555-5555-555555555555',
  'a1b2c3d4-6666-6666-6666-666666666666',
  'a1b2c3d4-7777-7777-7777-777777777777',
  'a1b2c3d4-8888-8888-8888-888888888888',
  'a1b2c3d4-9999-9999-9999-999999999999',
  'a1b2c3d4-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'a1b2c3d4-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'a1b2c3d4-cccc-cccc-cccc-cccccccccccc'
);

-- 5. ADD APPOINTMENTS
INSERT INTO public.appointments (id, doctor_id, patient_id, service_id, appointment_date, start_time, end_time, status, notes, created_at, updated_at, booked_fee) VALUES
('a1b2c3d4-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000010', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', '00000000-0000-0000-0000-000000000001', '2026-02-25', '10:00:00', '10:30:00', 'completed', 'Regular checkup', '2026-02-24 10:00:00+00', '2026-02-25 11:00:00+00', 500.00),
('a1b2c3d4-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000011', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', '00000000-0000-0000-0000-000000000002', '2026-02-20', '14:00:00', '14:30:00', 'completed', 'Skin consultation', '2026-02-19 15:00:00+00', '2026-02-20 15:30:00+00', 300.00),
('a1b2c3d4-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000010', '714d8ea7-ef88-4a01-ab1f-4726f0a35d64', '00000000-0000-0000-0000-000000000001', '2026-02-28', '11:00:00', '11:30:00', 'completed', 'Diabetes follow-up', '2026-02-27 09:00:00+00', '2026-02-28 12:00:00+00', 500.00),
('a1b2c3d4-4444-4444-4444-444444444444', '281e38c8-0aec-453a-b475-0d252050e47d', '579bd8b7-9fd0-4fe8-b055-3b6aaf2aedf5', 'd4400c44-be09-4402-b418-aa23eac2b8f8', '2026-02-26', '09:00:00', '09:30:00', 'cancelled', 'Patient cancelled', '2026-02-25 12:00:00+00', '2026-02-25 18:00:00+00', 500.00),
('a1b2c3d4-5555-5555-5555-555555555555', '0c005620-bb41-4913-ba2f-c9f3b00b03fc', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', '00000000-0000-0000-0000-000000000001', '2026-02-27', '15:00:00', '15:30:00', 'no-show', 'No show', '2026-02-26 14:00:00+00', '2026-02-27 15:30:00+00', 660.00),
-- TODAY
('a1b2c3d4-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000010', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', '00000000-0000-0000-0000-000000000001', '2026-03-02', '10:00:00', '10:30:00', 'confirmed', 'Video call today', '2026-03-01 10:00:00+00', '2026-03-01 10:00:00+00', 500.00),
('a1b2c3d4-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000011', '714d8ea7-ef88-4a01-ab1f-4726f0a35d64', '00000000-0000-0000-0000-000000000001', '2026-03-02', '14:00:00', '14:30:00', 'pending', 'Skin checkup', '2026-03-02 08:00:00+00', '2026-03-02 08:00:00+00', 600.00),
('a1b2c3d4-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000010', '579bd8b7-9fd0-4fe8-b055-3b6aaf2aedf5', '00000000-0000-0000-0000-000000000002', '2026-03-02', '16:00:00', '16:30:00', 'pending', 'Chat consultation', '2026-03-02 09:00:00+00', '2026-03-02 09:00:00+00', 300.00),
-- FUTURE
('a1b2c3d4-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000010', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', '00000000-0000-0000-0000-000000000001', '2026-03-05', '11:00:00', '11:30:00', 'confirmed', 'Follow-up', '2026-03-02 11:00:00+00', '2026-03-02 11:00:00+00', 500.00),
('a1b2c3d4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '0c005620-bb41-4913-ba2f-c9f3b00b03fc', '714d8ea7-ef88-4a01-ab1f-4726f0a35d64', '00000000-0000-0000-0000-000000000003', '2026-03-10', '10:00:00', '11:00:00', 'pending', 'Home visit', '2026-03-02 14:00:00+00', '2026-03-02 14:00:00+00', 1800.00),
('a1b2c3d4-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000011', '579bd8b7-9fd0-4fe8-b055-3b6aaf2aedf5', '00000000-0000-0000-0000-000000000001', '2026-03-08', '15:00:00', '15:30:00', 'confirmed', 'Video call', '2026-03-01 16:00:00+00', '2026-03-01 16:00:00+00', 600.00),
('a1b2c3d4-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000011', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', '00000000-0000-0000-0000-000000000006', '2026-03-12', '11:00:00', '11:15:00', 'pending', 'Follow-up', '2026-03-02 17:00:00+00', '2026-03-02 17:00:00+00', 200.00);

-- 6. DELETE OLD TEST PAYMENTS
DELETE FROM public.payments WHERE id IN (
  'p1y2m3t4-1111-1111-1111-111111111111',
  'p1y2m3t4-2222-2222-2222-222222222222',
  'p1y2m3t4-3333-3333-3333-333333333333',
  'p1y2m3t4-6666-6666-6666-666666666666'
);

-- 7. ADD PAYMENTS
INSERT INTO public.payments (id, appointment_id, doctor_id, patient_id, amount, currency, payment_method, transaction_id, status, created_at, updated_at) VALUES
('p1y2m3t4-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000010', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', 500.00, 'INR', 'upi', 'TXN-202602251000', 'completed', '2026-02-24 10:05:00+00', '2026-02-25 10:35:00+00'),
('p1y2m3t4-2222-2222-2222-222222222222', 'a1b2c3d4-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000011', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', 300.00, 'INR', 'card', 'TXN-202602191530', 'completed', '2026-02-19 15:05:00+00', '2026-02-20 14:35:00+00'),
('p1y2m3t4-3333-3333-3333-333333333333', 'a1b2c3d4-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000010', '714d8ea7-ef88-4a01-ab1f-4726f0a35d64', 500.00, 'INR', 'upi', 'TXN-202602271200', 'completed', '2026-02-27 09:05:00+00', '2026-02-28 11:35:00+00'),
('p1y2m3t4-6666-6666-6666-666666666666', 'a1b2c3d4-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000010', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', 500.00, 'INR', 'upi', 'TXN-202603011000', 'completed', '2026-03-01 10:05:00+00', '2026-03-01 10:05:00+00');

-- 8. DELETE OLD FOLLOW-UPS
DELETE FROM public.follow_ups WHERE id IN (
  'f1u2p3-1111-1111-1111-111111111111',
  'f1u2p3-2222-2222-2222-222222222222'
);

-- 9. ADD FOLLOW-UPS
INSERT INTO public.follow_ups (id, appointment_id, doctor_id, patient_id, scheduled_date, scheduled_time, follow_up_type, notes, status, created_at, updated_at) VALUES
('f1u2p3-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000010', 'f6547df0-4e4b-43e2-b2fb-c529669e0247', '2026-03-10', '10:00:00', 'followup', 'Routine follow-up', 'pending', '2026-02-25 11:00:00+00', '2026-02-25 11:00:00+00'),
('f1u2p3-2222-2222-2222-222222222222', 'a1b2c3d4-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000010', '714d8ea7-ef88-4a01-ab1f-4726f0a35d64', '2026-03-15', '11:30:00', 'followup', 'Diabetes follow-up', 'pending', '2026-02-28 12:00:00+00', '2026-02-28 12:00:00+00');

-- 10. VERIFY
SELECT 'Time Slots:' as info, COUNT(*) FROM public.time_slots WHERE doctor_id = '00000000-0000-0000-0000-000000000010'
UNION ALL
SELECT 'Appointments:', COUNT(*) FROM public.appointments
UNION ALL
SELECT 'Payments:', COUNT(*) FROM public.payments
UNION ALL
SELECT 'Follow-ups:', COUNT(*) FROM public.follow_ups;
