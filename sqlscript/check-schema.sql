-- Check actual table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'time_slots';

-- Check constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'time_slots'::regclass;
