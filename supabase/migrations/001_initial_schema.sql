-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('parent', 'babysitter');
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- Profiles (extends auth.users)
create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  role          user_role,
  full_name     text,
  avatar_url    text,
  bio           text,
  location      text,
  lat           float,
  lng           float,
  hourly_rate   numeric,
  years_experience int,
  certifications text[],
  languages     text[],
  rating_avg    float default 0,
  rating_count  int default 0,
  created_at    timestamptz default now()
);

-- Availability slots
create table availability (
  id              uuid primary key default uuid_generate_v4(),
  babysitter_id   uuid not null references profiles on delete cascade,
  start_time      timestamptz not null,
  end_time        timestamptz not null,
  is_recurring    boolean default false,
  recurrence_rule text
);

-- Bookings
create table bookings (
  id              uuid primary key default uuid_generate_v4(),
  parent_id       uuid not null references profiles on delete cascade,
  babysitter_id   uuid not null references profiles on delete cascade,
  start_time      timestamptz not null,
  end_time        timestamptz not null,
  status          booking_status default 'pending',
  notes           text,
  total_price     numeric,
  created_at      timestamptz default now()
);

-- Reviews
create table reviews (
  id           uuid primary key default uuid_generate_v4(),
  booking_id   uuid not null references bookings on delete cascade,
  reviewer_id  uuid not null references profiles on delete cascade,
  reviewee_id  uuid not null references profiles on delete cascade,
  rating       int not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz default now(),
  unique(booking_id, reviewer_id)
);

-- Conversations
create table conversations (
  id            uuid primary key default uuid_generate_v4(),
  parent_id     uuid not null references profiles on delete cascade,
  babysitter_id uuid not null references profiles on delete cascade,
  created_at    timestamptz default now(),
  unique(parent_id, babysitter_id)
);

-- Messages
create table messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references conversations on delete cascade,
  sender_id        uuid not null references profiles on delete cascade,
  body             text not null,
  read_at          timestamptz,
  created_at       timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Update rating_avg when a review is inserted
create or replace function update_rating()
returns trigger as $$
begin
  update profiles set
    rating_avg = (
      select avg(rating) from reviews where reviewee_id = new.reviewee_id
    ),
    rating_count = (
      select count(*) from reviews where reviewee_id = new.reviewee_id
    )
  where id = new.reviewee_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_inserted
  after insert on reviews
  for each row execute procedure update_rating();
