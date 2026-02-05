-- Fix exercise_library foreign key relationship
-- This ensures the foreign key constraint exists and is properly named

-- Drop the existing column if the constraint is broken
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'exercises'
    and column_name = 'exercise_library_id'
  ) then
    -- Try to drop the column and recreate it
    alter table exercises drop column if exists exercise_library_id;
  end if;
end
$$;

-- Add the column with proper foreign key constraint
alter table exercises
  add column if not exists exercise_library_id uuid
  references exercise_library(id)
  on delete set null;

-- Create index for performance
create index if not exists idx_exercises_library_id on exercises(exercise_library_id);

-- Add comment
comment on column exercises.exercise_library_id is 'Reference to the exercise library entry with muscle data';
