create table patient_details (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,
  age integer,
  gender text,

  phone text unique not null,
  email text,

  address text,
  issue_description text,

  created_at timestamp default now()
);

create index idx_patient_phone on patient_details(phone);