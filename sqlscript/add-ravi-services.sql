-- Add services for Ravi Tomar (user_id: 0c005620-bb41-4913-ba2f-c9f3b00b03fc)
-- Uses the correct service UUIDs from services table
INSERT INTO public.doctor_services (doctor_id, service_id, enabled, created_at, updated_at, fee)
VALUES 
  ('0c005620-bb41-4913-ba2f-c9f3b00b03fc', '00000000-0000-0000-0000-000000000001', true, NOW(), NOW(), 600),
  ('0c005620-bb41-4913-ba2f-c9f3b00b03fc', '00000000-0000-0000-0000-000000000002', true, NOW(), NOW(), 400),
  ('0c005620-bb41-4913-ba2f-c9f3b00b03fc', '00000000-0000-0000-0000-000000000003', true, NOW(), NOW(), 1800),
  ('0c005620-bb41-4913-ba2f-c9f3b00b03fc', '00000000-0000-0000-0000-000000000006', true, NOW(), NOW(), 250),
  ('0c005620-bb41-4913-ba2f-c9f3b00b03fc', '00000000-0000-0000-0000-000000000007', true, NOW(), NOW(), 350)
ON CONFLICT DO NOTHING;

SELECT * FROM public.doctor_services WHERE doctor_id = '0c005620-bb41-4913-ba2f-c9f3b00b03fc';
