-- migrations/20250921_create_projects.sql
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  project_type text not null, -- prototype|fine_tune|production
  model_approach text not null, -- api_only|fine_tune|from_scratch
  dataset_gb numeric default 0,
  label_count integer default 0,
  monthly_tokens bigint default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_projects_user_id on public.projects(user_id);

-- Enable Row Level Security
alter table public.projects enable row level security;

-- Create policies for projects table
create policy "Users can view their own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert their own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete their own projects" on public.projects
  for delete using (auth.uid() = user_id);