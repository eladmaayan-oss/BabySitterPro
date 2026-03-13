-- Enable RLS on all tables
alter table profiles enable row level security;
alter table availability enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- PROFILES
-- Anyone authenticated can read all profiles
create policy "Profiles are viewable by authenticated users"
  on profiles for select using (auth.role() = 'authenticated');

-- Users can only update their own profile
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- AVAILABILITY
-- Authenticated users can read availability (for browsing/booking)
create policy "Availability is viewable by authenticated users"
  on availability for select using (auth.role() = 'authenticated');

-- Babysitters can manage their own slots
create policy "Babysitters can insert own availability"
  on availability for insert with check (auth.uid() = babysitter_id);

create policy "Babysitters can delete own availability"
  on availability for delete using (auth.uid() = babysitter_id);

-- BOOKINGS
-- Parents and babysitters can see their own bookings
create policy "Users can view own bookings"
  on bookings for select using (
    auth.uid() = parent_id or auth.uid() = babysitter_id
  );

-- Parents can create bookings
create policy "Parents can create bookings"
  on bookings for insert with check (auth.uid() = parent_id);

-- Babysitters can update booking status (confirm/decline)
-- Parents can also update (cancel)
create policy "Booking participants can update status"
  on bookings for update using (
    auth.uid() = parent_id or auth.uid() = babysitter_id
  );

-- REVIEWS
-- Anyone authenticated can read reviews
create policy "Reviews are viewable by authenticated users"
  on reviews for select using (auth.role() = 'authenticated');

-- Only reviewer can write their review
create policy "Reviewers can insert reviews"
  on reviews for insert with check (auth.uid() = reviewer_id);

-- CONVERSATIONS
-- Only participants can read their conversations
create policy "Participants can view conversations"
  on conversations for select using (
    auth.uid() = parent_id or auth.uid() = babysitter_id
  );

-- Participants can create conversations
create policy "Authenticated users can create conversations"
  on conversations for insert with check (
    auth.uid() = parent_id or auth.uid() = babysitter_id
  );

-- MESSAGES
-- Only conversation participants can read messages
create policy "Participants can view messages"
  on messages for select using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (c.parent_id = auth.uid() or c.babysitter_id = auth.uid())
    )
  );

-- Only participants can send messages
create policy "Participants can send messages"
  on messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (c.parent_id = auth.uid() or c.babysitter_id = auth.uid())
    )
  );
