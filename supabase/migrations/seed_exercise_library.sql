-- Seed Exercise Library
-- This script inserts all exercises into the exercise_library table
-- First pass: Insert exercises without base_exercise_id
-- Second pass: Update exercises that reference base exercises

-- =====================================================
-- FIRST PASS: Insert exercises WITHOUT base_exercise_id
-- =====================================================

-- Compound Push (Barbell)
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir) VALUES
('Bench Press', ARRAY['Barbell Bench Press', 'Chest Press'], 'compound', 'push', 'barbell', '[{"muscle": "Pectoralis Major", "activation": 85}]'::jsonb, '[{"muscle": "Anterior Deltoid", "activation": 60}, {"muscle": "Triceps Brachii", "activation": 45}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Overhead Press', ARRAY['Military Press', 'Shoulder Press'], 'compound', 'push', 'barbell', '[{"muscle": "Anterior Deltoid", "activation": 80}]'::jsonb, '[{"muscle": "Triceps Brachii", "activation": 50}, {"muscle": "Upper Pectoralis", "activation": 40}, {"muscle": "Trapezius", "activation": 30}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Squat', ARRAY['Back Squat', 'Barbell Squat'], 'compound', 'legs', 'barbell', '[{"muscle": "Quadriceps", "activation": 75}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 70}, {"muscle": "Erector Spinae", "activation": 60}, {"muscle": "Adductor Magnus", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Deadlift', ARRAY['Conventional Deadlift'], 'compound', 'pull', 'barbell', '[{"muscle": "Erector Spinae", "activation": 75}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 70}, {"muscle": "Hamstrings", "activation": 60}, {"muscle": "Trapezius", "activation": 50}, {"muscle": "Latissimus Dorsi", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Barbell Row', ARRAY['Bent Over Row'], 'compound', 'pull', 'barbell', '[{"muscle": "Latissimus Dorsi", "activation": 75}]'::jsonb, '[{"muscle": "Rhomboids", "activation": 60}, {"muscle": "Trapezius (Middle)", "activation": 55}, {"muscle": "Posterior Deltoid", "activation": 50}, {"muscle": "Biceps Brachii", "activation": 45}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Hip Thrust', ARRAY['Barbell Hip Thrust'], 'compound', 'legs', 'barbell', '[{"muscle": "Gluteus Maximus", "activation": 90}]'::jsonb, '[{"muscle": "Hamstrings", "activation": 45}, {"muscle": "Quadriceps", "activation": 30}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Lunges', ARRAY['Barbell Lunges'], 'compound', 'legs', 'barbell', '[{"muscle": "Quadriceps", "activation": 70}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 65}, {"muscle": "Hamstrings", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Dumbbell Snatch', ARRAY['DB Snatch'], 'compound', 'pull', 'dumbbell', '[{"muscle": "Quadriceps", "activation": 50}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 60}, {"muscle": "Deltoids", "activation": 45}, {"muscle": "Trapezius", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Dumbbell Thruster', ARRAY[]::text[], 'compound', 'push', 'dumbbell', '[{"muscle": "Quadriceps", "activation": 60}]'::jsonb, '[{"muscle": "Anterior Deltoid", "activation": 55}, {"muscle": "Triceps Brachii", "activation": 50}, {"muscle": "Pectoralis Major", "activation": 45}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Dumbbell Clean', ARRAY[]::text[], 'compound', 'pull', 'dumbbell', '[{"muscle": "Quadriceps", "activation": 55}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 60}, {"muscle": "Deltoids", "activation": 40}, {"muscle": "Trapezius", "activation": 35}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Arnold Press', ARRAY[]::text[], 'compound', 'push', 'dumbbell', '[{"muscle": "Anterior Deltoid", "activation": 75}]'::jsonb, '[{"muscle": "Medial Deltoid", "activation": 60}, {"muscle": "Triceps Brachii", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, true, false),

-- Compound Push (Machine)
('Lat Pulldown', ARRAY['Lat Pulldown', 'Pulldown'], 'compound', 'pull', 'machine', '[{"muscle": "Latissimus Dorsi", "activation": 85}]'::jsonb, '[{"muscle": "Trapezius (Lower)", "activation": 40}, {"muscle": "Biceps Brachii", "activation": 35}, {"muscle": "Rhomboids", "activation": 30}]'::jsonb, 'increase', NULL, 1.0, true, false),

-- Compound (Bodyweight)
('Pull Up', ARRAY['Pullup', 'Chin Up'], 'compound', 'pull', 'bodyweight', '[{"muscle": "Latissimus Dorsi", "activation": 85}]'::jsonb, '[{"muscle": "Trapezius (Lower)", "activation": 55}, {"muscle": "Biceps Brachii", "activation": 50}, {"muscle": "Rhomboids", "activation": 45}]'::jsonb, 'decrease', NULL, 1.0, true, true),
('Push Up', ARRAY['Pushup'], 'compound', 'push', 'bodyweight', '[{"muscle": "Pectoralis Major", "activation": 75}]'::jsonb, '[{"muscle": "Triceps Brachii", "activation": 50}, {"muscle": "Anterior Deltoid", "activation": 45}]'::jsonb, 'decrease', NULL, 1.0, true, true),
('Dip', ARRAY['Chest Dip', 'Tricep Dip'], 'compound', 'push', 'bodyweight', '[{"muscle": "Triceps Brachii", "activation": 70}]'::jsonb, '[{"muscle": "Pectoralis Major (Lower)", "activation": 60}, {"muscle": "Anterior Deltoid", "activation": 50}]'::jsonb, 'decrease', NULL, 1.0, true, true),
('Pistol Squat', ARRAY['Single Leg Squat'], 'compound', 'legs', 'bodyweight', '[{"muscle": "Quadriceps", "activation": 80}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 60}]'::jsonb, 'decrease', NULL, 1.0, true, true),
('Lunge', ARRAY['Bodyweight Lunge'], 'compound', 'legs', 'bodyweight', '[{"muscle": "Quadriceps", "activation": 65}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 60}, {"muscle": "Hamstrings", "activation": 30}]'::jsonb, 'decrease', NULL, 1.0, true, true),
('Burpee', ARRAY[]::text[], 'compound', 'legs', 'bodyweight', '[{"muscle": "Quadriceps", "activation": 60}]'::jsonb, '[{"muscle": "Pectoralis Major", "activation": 45}, {"muscle": "Gluteus Maximus", "activation": 40}]'::jsonb, 'decrease', NULL, 1.0, true, true),
('Muscle Up', ARRAY[]::text[], 'compound', 'pull', 'bodyweight', '[{"muscle": "Latissimus Dorsi", "activation": 70}]'::jsonb, '[{"muscle": "Triceps Brachii", "activation": 60}, {"muscle": "Pectoralis Major", "activation": 50}]'::jsonb, 'decrease', NULL, 1.0, true, true),

-- Compound (Cable) - Isolation exercises
('Cable Fly', ARRAY['Cable Crossover', 'Chest Fly'], 'isolation', 'push', 'cable', '[{"muscle": "Pectoralis Major", "activation": 85}]'::jsonb, '[{"muscle": "Anterior Deltoid", "activation": 35}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Face Pull', ARRAY[]::text[], 'isolation', 'pull', 'cable', '[{"muscle": "Posterior Deltoid", "activation": 80}]'::jsonb, '[{"muscle": "Rhomboids", "activation": 50}, {"muscle": "Trapezius (Middle)", "activation": 45}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Tricep Pushdown', ARRAY['Tricep Pushdown', 'Cable Tricep Extension'], 'isolation', 'push', 'cable', '[{"muscle": "Triceps Brachii", "activation": 90}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Cable Curl', ARRAY[]::text[], 'isolation', 'pull', 'cable', '[{"muscle": "Biceps Brachii", "activation": 90}]'::jsonb, '[{"muscle": "Brachialis", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Cable Kickback', ARRAY['Tricep Kickback'], 'isolation', 'push', 'cable', '[{"muscle": "Triceps Brachii", "activation": 85}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Cable Crunch', ARRAY[]::text[], 'isolation', 'core', 'cable', '[{"muscle": "Rectus Abdominis", "activation": 80}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Cable Woodchop', ARRAY[]::text[], 'isolation', 'core', 'cable', '[{"muscle": "Obliques", "activation": 75}]'::jsonb, '[{"muscle": "Rectus Abdominis", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Straight Arm Pulldown', ARRAY[]::text[], 'isolation', 'pull', 'cable', '[{"muscle": "Latissimus Dorsi", "activation": 80}]'::jsonb, '[{"muscle": "Trapezius (Lower)", "activation": 40}, {"muscle": "Pectoralis Major", "activation": 30}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Cable Lateral Raise', ARRAY[]::text[], 'isolation', 'push', 'cable', '[{"muscle": "Medial Deltoid", "activation": 85}]'::jsonb, '[{"muscle": "Trapezius (Middle)", "activation": 30}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Cable Rear Delt Fly', ARRAY[]::text[], 'isolation', 'pull', 'cable', '[{"muscle": "Posterior Deltoid", "activation": 85}]'::jsonb, '[{"muscle": "Rhomboids", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, false, true),

-- Isolation Arms (Dumbbell)
('Bicep Curl', ARRAY['Dumbbell Curl', 'DB Curl'], 'isolation', 'pull', 'dumbbell', '[{"muscle": "Biceps Brachii", "activation": 90}]'::jsonb, '[{"muscle": "Brachialis", "activation": 50}, {"muscle": "Brachioradialis", "activation": 30}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Hammer Curl', ARRAY[]::text[], 'isolation', 'pull', 'dumbbell', '[{"muscle": "Brachialis", "activation": 75}]'::jsonb, '[{"muscle": "Brachioradialis", "activation": 65}, {"muscle": "Biceps Brachii", "activation": 55}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Tricep Extension', ARRAY['Dumbbell Tricep Extension', 'DB Tricep Extension'], 'isolation', 'push', 'dumbbell', '[{"muscle": "Triceps Brachii", "activation": 90}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Overhead Tricep Extension', ARRAY['DB Overhead Extension'], 'isolation', 'push', 'dumbbell', '[{"muscle": "Triceps Brachii (Long Head)", "activation": 90}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Skull Crusher', ARRAY[]::text[], 'isolation', 'push', 'dumbbell', '[{"muscle": "Triceps Brachii", "activation": 90}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Reverse Curl', ARRAY[]::text[], 'isolation', 'pull', 'dumbbell', '[{"muscle": "Brachioradialis", "activation": 80}]'::jsonb, '[{"muscle": "Brachialis", "activation": 55}, {"muscle": "Biceps Brachii", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Wrist Curl', ARRAY[]::text[], 'isolation', 'pull', 'dumbbell', '[{"muscle": "Wrist Flexors", "activation": 90}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),

-- Isolation Shoulders (Dumbbell)
('Lateral Raise', ARRAY['Side Raise', 'DB Lateral Raise'], 'isolation', 'push', 'dumbbell', '[{"muscle": "Medial Deltoid", "activation": 85}]'::jsonb, '[{"muscle": "Trapezius (Middle)", "activation": 35}, {"muscle": "Supraspinatus", "activation": 30}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Front Raise', ARRAY[]::text[], 'isolation', 'push', 'dumbbell', '[{"muscle": "Anterior Deltoid", "activation": 85}]'::jsonb, '[{"muscle": "Pectoralis Major (Clavicular)", "activation": 35}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Rear Delt Fly', ARRAY['Rear Delt Raise', 'Reverse Fly'], 'isolation', 'pull', 'dumbbell', '[{"muscle": "Posterior Deltoid", "activation": 85}]'::jsonb, '[{"muscle": "Rhomboids", "activation": 45}, {"muscle": "Trapezius (Middle)", "activation": 35}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Shrug', ARRAY['DB Shrug', 'Dumbbell Shrug'], 'isolation', 'pull', 'dumbbell', '[{"muscle": "Trapezius (Upper)", "activation": 85}]'::jsonb, '[{"muscle": "Levator Scapulae", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Upright Row', ARRAY[]::text[], 'compound', 'pull', 'dumbbell', '[{"muscle": "Trapezius (Middle)", "activation": 70}]'::jsonb, '[{"muscle": "Medial Deltoid", "activation": 65}, {"muscle": "Biceps Brachii", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, true, false),

-- Isolation Legs (Dumbbell)
('Bulgarian Split Squat', ARRAY[]::text[], 'compound', 'legs', 'dumbbell', '[{"muscle": "Quadriceps", "activation": 85}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 60}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Step Up', ARRAY[]::text[], 'compound', 'legs', 'dumbbell', '[{"muscle": "Quadriceps", "activation": 70}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 60}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Calf Raise', ARRAY['DB Calf Raise', 'Dumbbell Calf Raise'], 'isolation', 'legs', 'dumbbell', '[{"muscle": "Gastrocnemius", "activation": 85}]'::jsonb, '[{"muscle": "Soleus", "activation": 45}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Seated Calf Raise', ARRAY[]::text[], 'isolation', 'legs', 'dumbbell', '[{"muscle": "Soleus", "activation": 85}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),

-- Isolation Core
('Plank', ARRAY['Front Plank'], 'isolation', 'core', 'bodyweight', '[{"muscle": "Rectus Abdominis", "activation": 70}]'::jsonb, '[{"muscle": "Transverse Abdominis", "activation": 60}, {"muscle": "Obliques", "activation": 40}]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Side Plank', ARRAY[]::text[], 'isolation', 'core', 'bodyweight', '[{"muscle": "Obliques", "activation": 75}]'::jsonb, '[{"muscle": "Quadratus Lumborum", "activation": 40}]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Crunch', ARRAY['Ab Crunch', 'Sit Up'], 'isolation', 'core', 'bodyweight', '[{"muscle": "Rectus Abdominis", "activation": 85}]'::jsonb, '[]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Leg Raise', ARRAY['Hanging Leg Raise', 'Leg Lift'], 'isolation', 'core', 'bodyweight', '[{"muscle": "Rectus Abdominis", "activation": 80}]'::jsonb, '[{"muscle": "Hip Flexors", "activation": 50}]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Russian Twist', ARRAY[]::text[], 'isolation', 'core', 'bodyweight', '[{"muscle": "Obliques", "activation": 80}]'::jsonb, '[{"muscle": "Rectus Abdominis", "activation": 40}]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Mountain Climber', ARRAY[]::text[], 'compound', 'core', 'bodyweight', '[{"muscle": "Rectus Abdominis", "activation": 60}]'::jsonb, '[{"muscle": "Hip Flexors", "activation": 50}, {"muscle": "Obliques", "activation": 40}]'::jsonb, 'decrease', NULL, 1.0, true, true),
('Dead Bug', ARRAY[]::text[], 'isolation', 'core', 'bodyweight', '[{"muscle": "Transverse Abdominis", "activation": 70}]'::jsonb, '[{"muscle": "Rectus Abdominis", "activation": 50}]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Bird Dog', ARRAY[]::text[], 'isolation', 'core', 'bodyweight', '[{"muscle": "Erector Spinae", "activation": 60}]'::jsonb, '[{"muscle": "Transverse Abdominis", "activation": 55}, {"muscle": "Gluteus Maximus", "activation": 40}]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Superman', ARRAY[]::text[], 'isolation', 'core', 'bodyweight', '[{"muscle": "Erector Spinae", "activation": 70}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 50}, {"muscle": "Hamstrings", "activation": 30}]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Hollow Body Hold', ARRAY[]::text[], 'isolation', 'core', 'bodyweight', '[{"muscle": "Transverse Abdominis", "activation": 75}]'::jsonb, '[{"muscle": "Rectus Abdominis", "activation": 50}]'::jsonb, 'decrease', NULL, 1.0, false, true),

-- Kettlebell
('Kettlebell Snatch', ARRAY['KB Snatch'], 'compound', 'pull', 'kettlebell', '[{"muscle": "Quadriceps", "activation": 55}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 60}, {"muscle": "Deltoids", "activation": 45}, {"muscle": "Trapezius", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Kettlebell Clean', ARRAY['KB Clean'], 'compound', 'pull', 'kettlebell', '[{"muscle": "Quadriceps", "activation": 50}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 65}, {"muscle": "Deltoids", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Turkish Get Up', ARRAY['TGU', 'KB Get Up'], 'compound', 'core', 'kettlebell', '[{"muscle": "Core", "activation": 70}]'::jsonb, '[{"muscle": "Deltoids", "activation": 45}, {"muscle": "Gluteus Maximus", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, true, false),

-- Band Exercises
('Band Pull Apart', ARRAY[]::text[], 'isolation', 'pull', 'band', '[{"muscle": "Posterior Deltoid", "activation": 75}]'::jsonb, '[{"muscle": "Rhomboids", "activation": 50}, {"muscle": "Trapezius (Middle)", "activation": 45}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Band Face Pull', ARRAY[]::text[], 'isolation', 'pull', 'band', '[{"muscle": "Posterior Deltoid", "activation": 75}]'::jsonb, '[{"muscle": "Rhomboids", "activation": 45}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Band Lateral Raise', ARRAY[]::text[], 'isolation', 'push', 'band', '[{"muscle": "Medial Deltoid", "activation": 80}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Band Tricep Pushdown', ARRAY[]::text[], 'isolation', 'push', 'band', '[{"muscle": "Triceps Brachii", "activation": 85}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Band Bicep Curl', ARRAY[]::text[], 'isolation', 'pull', 'band', '[{"muscle": "Biceps Brachii", "activation": 85}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),

-- Accessory Exercises
('Farmer Walk', ARRAY[]::text[], 'accessory', 'core', 'dumbbell', '[{"muscle": "Trapezius (Upper)", "activation": 60}]'::jsonb, '[{"muscle": "Forearms", "activation": 55}, {"muscle": "Core", "activation": 45}]'::jsonb, 'increase', NULL, 1.0, true, false),
('Farmers Hold', ARRAY[]::text[], 'accessory', 'core', 'dumbbell', '[{"muscle": "Forearms", "activation": 65}]'::jsonb, '[{"muscle": "Trapezius (Upper)", "activation": 50}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Sissy Squat', ARRAY[]::text[], 'isolation', 'legs', 'bodyweight', '[{"muscle": "Quadriceps", "activation": 85}]'::jsonb, '[]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Nordic Curl', ARRAY[]::text[], 'isolation', 'legs', 'bodyweight', '[{"muscle": "Hamstrings", "activation": 85}]'::jsonb, '[{"muscle": "Gluteus Maximus", "activation": 40}]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Fire Hydrant', ARRAY['Quadruped Hip Abduction'], 'accessory', 'legs', 'bodyweight', '[{"muscle": "Gluteus Medius", "activation": 80}]'::jsonb, '[]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Clamshell', ARRAY[]::text[], 'accessory', 'legs', 'bodyweight', '[{"muscle": "Gluteus Medius", "activation": 85}]'::jsonb, '[]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Donkey Kick', ARRAY[]::text[], 'accessory', 'legs', 'bodyweight', '[{"muscle": "Gluteus Maximus", "activation": 80}]'::jsonb, '[]'::jsonb, 'decrease', NULL, 1.0, false, true),
('Bear Crawl', ARRAY[]::text[], 'accessory', 'core', 'bodyweight', '[{"muscle": "Core", "activation": 70}]'::jsonb, '[{"muscle": "Deltoids", "activation": 45}, {"muscle": "Hip Flexors", "activation": 40}]'::jsonb, 'decrease', NULL, 1.0, true, true),
('Crab Walk', ARRAY[]::text[], 'accessory', 'core', 'bodyweight', '[{"muscle": "Triceps Brachii", "activation": 60}]'::jsonb, '[{"muscle": "Deltoids", "activation": 40}, {"muscle": "Core", "activation": 35}]'::jsonb, 'decrease', NULL, 1.0, true, true),
('L Sit', ARRAY[]::text[], 'accessory', 'core', 'bodyweight', '[{"muscle": "Rectus Abdominis", "activation": 75}]'::jsonb, '[{"muscle": "Hip Flexors", "activation": 50}]'::jsonb, 'decrease', NULL, 1.0, false, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECOND PASS: Insert exercises WITH base_exercise_id
-- =====================================================

-- Compound Push (Barbell) - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Close Grip Bench Press',
  ARRAY['Close-Grip Bench'],
  'compound',
  'push',
  'barbell',
  '[{"muscle": "Pectoralis Major", "activation": 75}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 70}, {"muscle": "Anterior Deltoid", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bench Press'),
  0.9,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Close Grip Bench Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Incline Bench Press',
  ARRAY['Incline Press'],
  'compound',
  'push',
  'barbell',
  '[{"muscle": "Pectoralis Major (Clavicular)", "activation": 85}]'::jsonb,
  '[{"muscle": "Anterior Deltoid", "activation": 65}, {"muscle": "Triceps Brachii", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bench Press'),
  0.9,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Incline Bench Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Decline Bench Press',
  ARRAY[]::text[],
  'compound',
  'push',
  'barbell',
  '[{"muscle": "Pectoralis Major (Sternocostal)", "activation": 85}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 50}, {"muscle": "Anterior Deltoid", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bench Press'),
  0.95,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Decline Bench Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Front Squat',
  ARRAY[]::text[],
  'compound',
  'legs',
  'barbell',
  '[{"muscle": "Quadriceps", "activation": 80}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 60}, {"muscle": "Erector Spinae", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Squat'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Front Squat');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Romanian Deadlift',
  ARRAY['RDL'],
  'compound',
  'pull',
  'barbell',
  '[{"muscle": "Hamstrings", "activation": 80}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 70}, {"muscle": "Erector Spinae", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Deadlift'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Romanian Deadlift');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Sumo Deadlift',
  ARRAY[]::text[],
  'compound',
  'pull',
  'barbell',
  '[{"muscle": "Quadriceps", "activation": 65}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 75}, {"muscle": "Adductor Magnus", "activation": 60}, {"muscle": "Erector Spinae", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Deadlift'),
  0.9,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Sumo Deadlift');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Pendlay Row',
  ARRAY[]::text[],
  'compound',
  'pull',
  'barbell',
  '[{"muscle": "Latissimus Dorsi", "activation": 80}]'::jsonb,
  '[{"muscle": "Rhomboids", "activation": 70}, {"muscle": "Trapezius (Middle)", "activation": 60}, {"muscle": "Posterior Deltoid", "activation": 50}, {"muscle": "Biceps Brachii", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Barbell Row'),
  0.95,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Pendlay Row');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'T-Bar Row',
  ARRAY['T Bar Row'],
  'compound',
  'pull',
  'barbell',
  '[{"muscle": "Latissimus Dorsi", "activation": 80}]'::jsonb,
  '[{"muscle": "Rhomboids", "activation": 65}, {"muscle": "Trapezius (Middle)", "activation": 60}, {"muscle": "Posterior Deltoid", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Barbell Row'),
  1.05,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'T-Bar Row');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Split Squat',
  ARRAY['Bulgarian Split Squat'],
  'compound',
  'legs',
  'barbell',
  '[{"muscle": "Quadriceps", "activation": 80}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 60}, {"muscle": "Hamstrings", "activation": 35}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Lunges'),
  0.9,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Split Squat');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Good Mornings',
  ARRAY[]::text[],
  'compound',
  'pull',
  'barbell',
  '[{"muscle": "Erector Spinae", "activation": 75}]'::jsonb,
  '[{"muscle": "Hamstrings", "activation": 65}, {"muscle": "Gluteus Maximus", "activation": 55}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Romanian Deadlift'),
  0.7,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Good Mornings');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Standing Press',
  ARRAY[]::text[],
  'compound',
  'push',
  'barbell',
  '[{"muscle": "Anterior Deltoid", "activation": 75}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 55}, {"muscle": "Upper Pectoralis", "activation": 35}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Overhead Press'),
  0.95,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Standing Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Push Press',
  ARRAY[]::text[],
  'compound',
  'push',
  'barbell',
  '[{"muscle": "Anterior Deltoid", "activation": 70}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 50}, {"muscle": "Upper Pectoralis", "activation": 30}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Overhead Press'),
  1.1,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Push Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Floor Press',
  ARRAY[]::text[],
  'compound',
  'push',
  'barbell',
  '[{"muscle": "Pectoralis Major", "activation": 80}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 50}, {"muscle": "Anterior Deltoid", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bench Press'),
  0.9,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Floor Press');

-- Compound Push (Dumbbell) - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Dumbbell Bench Press',
  ARRAY['DB Bench Press', 'Dumbbell Press'],
  'compound',
  'push',
  'dumbbell',
  '[{"muscle": "Pectoralis Major", "activation": 85}]'::jsonb,
  '[{"muscle": "Anterior Deltoid", "activation": 55}, {"muscle": "Triceps Brachii", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bench Press'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Dumbbell Bench Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Dumbbell Incline Press',
  ARRAY['DB Incline Press'],
  'compound',
  'push',
  'dumbbell',
  '[{"muscle": "Pectoralis Major (Clavicular)", "activation": 85}]'::jsonb,
  '[{"muscle": "Anterior Deltoid", "activation": 60}, {"muscle": "Triceps Brachii", "activation": 35}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bench Press'),
  0.8,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Dumbbell Incline Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Dumbbell Shoulder Press',
  ARRAY['DB Shoulder Press', 'Seated Dumbbell Press'],
  'compound',
  'push',
  'dumbbell',
  '[{"muscle": "Anterior Deltoid", "activation": 80}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 45}, {"muscle": "Upper Pectoralis", "activation": 35}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Overhead Press'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Dumbbell Shoulder Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Dumbbell Squat',
  ARRAY[]::text[],
  'compound',
  'legs',
  'dumbbell',
  '[{"muscle": "Quadriceps", "activation": 75}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 65}, {"muscle": "Erector Spinae", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Squat'),
  0.7,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Dumbbell Squat');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Dumbbell Lunges',
  ARRAY['DB Lunges'],
  'compound',
  'legs',
  'dumbbell',
  '[{"muscle": "Quadriceps", "activation": 70}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 65}, {"muscle": "Hamstrings", "activation": 35}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Lunges'),
  0.9,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Dumbbell Lunges');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Dumbbell Romanian Deadlift',
  ARRAY['DB RDL', 'Dumbbell RDL'],
  'compound',
  'pull',
  'dumbbell',
  '[{"muscle": "Hamstrings", "activation": 80}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 65}, {"muscle": "Erector Spinae", "activation": 45}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Romanian Deadlift'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Dumbbell Romanian Deadlift');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Dumbbell Row',
  ARRAY['DB Row', 'Single Arm Row'],
  'compound',
  'pull',
  'dumbbell',
  '[{"muscle": "Latissimus Dorsi", "activation": 75}]'::jsonb,
  '[{"muscle": "Rhomboids", "activation": 60}, {"muscle": "Trapezius (Middle)", "activation": 55}, {"muscle": "Biceps Brachii", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Barbell Row'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Dumbbell Row');

-- Compound Push (Machine) - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Chest Press Machine',
  ARRAY['Machine Chest Press', 'Chest Press'],
  'compound',
  'push',
  'machine',
  '[{"muscle": "Pectoralis Major", "activation": 85}]'::jsonb,
  '[{"muscle": "Anterior Deltoid", "activation": 55}, {"muscle": "Triceps Brachii", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bench Press'),
  0.9,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Chest Press Machine');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Shoulder Press Machine',
  ARRAY['Machine Shoulder Press'],
  'compound',
  'push',
  'machine',
  '[{"muscle": "Anterior Deltoid", "activation": 75}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 45}, {"muscle": "Medial Deltoid", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Overhead Press'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Shoulder Press Machine');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Leg Press',
  ARRAY['Machine Leg Press'],
  'compound',
  'legs',
  'machine',
  '[{"muscle": "Quadriceps", "activation": 75}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 65}, {"muscle": "Hamstrings", "activation": 35}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Squat'),
  1.1,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Leg Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Hack Squat',
  ARRAY[]::text[],
  'compound',
  'legs',
  'machine',
  '[{"muscle": "Quadriceps", "activation": 85}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Squat'),
  0.9,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Hack Squat');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Seated Cable Row',
  ARRAY['Cable Row'],
  'compound',
  'pull',
  'machine',
  '[{"muscle": "Latissimus Dorsi", "activation": 75}]'::jsonb,
  '[{"muscle": "Rhomboids", "activation": 60}, {"muscle": "Trapezius (Middle)", "activation": 55}, {"muscle": "Biceps Brachii", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Barbell Row'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Seated Cable Row');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Smith Machine Squat',
  ARRAY['Smith Squat'],
  'compound',
  'legs',
  'machine',
  '[{"muscle": "Quadriceps", "activation": 75}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 65}, {"muscle": "Erector Spinae", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Squat'),
  0.95,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Smith Machine Squat');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Smith Machine Bench Press',
  ARRAY[]::text[],
  'compound',
  'push',
  'machine',
  '[{"muscle": "Pectoralis Major", "activation": 85}]'::jsonb,
  '[{"muscle": "Anterior Deltoid", "activation": 60}, {"muscle": "Triceps Brachii", "activation": 45}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bench Press'),
  0.95,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Smith Machine Bench Press');

-- Machine Isolation Exercises (no base_exercise)
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir) VALUES
('Leg Extension', ARRAY[]::text[], 'isolation', 'legs', 'machine', '[{"muscle": "Quadriceps", "activation": 90}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Leg Curl', ARRAY['Hamstring Curl'], 'isolation', 'legs', 'machine', '[{"muscle": "Hamstrings", "activation": 90}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Chest Fly Machine', ARRAY['Pec Deck', 'Machine Fly'], 'isolation', 'push', 'machine', '[{"muscle": "Pectoralis Major", "activation": 85}]'::jsonb, '[{"muscle": "Anterior Deltoid", "activation": 35}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Lateral Raise Machine', ARRAY['Machine Lateral Raise'], 'isolation', 'push', 'machine', '[{"muscle": "Medial Deltoid", "activation": 85}]'::jsonb, '[{"muscle": "Trapezius (Middle)", "activation": 30}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Rear Delt Machine', ARRAY['Reverse Pec Deck', 'Rear Delt Fly'], 'isolation', 'pull', 'machine', '[{"muscle": "Posterior Deltoid", "activation": 85}]'::jsonb, '[{"muscle": "Rhomboids", "activation": 40}, {"muscle": "Trapezius (Middle)", "activation": 35}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Calf Raise Machine', ARRAY['Standing Calf Raise'], 'isolation', 'legs', 'machine', '[{"muscle": "Gastrocnemius", "activation": 85}]'::jsonb, '[{"muscle": "Soleus", "activation": 50}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Seated Calf Raise', ARRAY[]::text[], 'isolation', 'legs', 'machine', '[{"muscle": "Soleus", "activation": 85}]'::jsonb, '[]'::jsonb, 'increase', NULL, 1.0, false, true),
('Abductor Machine', ARRAY[]::text[], 'isolation', 'legs', 'machine', '[{"muscle": "Gluteus Medius", "activation": 80}]'::jsonb, '[{"muscle": "Tensor Fasciae Latae", "activation": 40}]'::jsonb, 'increase', NULL, 1.0, false, true),
('Adductor Machine', ARRAY[]::text[], 'isolation', 'legs', 'machine', '[{"muscle": "Adductor Magnus", "activation": 85}]'::jsonb, '[{"muscle": "Adductor Longus", "activation": 70}, {"muscle": "Adductor Brevis", "activation": 60}]'::jsonb, 'increase', NULL, 1.0, false, true)
ON CONFLICT (name) DO NOTHING;

-- Compound (Bodyweight) - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Chin Up',
  ARRAY[]::text[],
  'compound',
  'pull',
  'bodyweight',
  '[{"muscle": "Latissimus Dorsi", "activation": 75}]'::jsonb,
  '[{"muscle": "Biceps Brachii", "activation": 70}, {"muscle": "Trapezius (Lower)", "activation": 45}, {"muscle": "Rhomboids", "activation": 40}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Pull Up'),
  1.1,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Chin Up');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Squat',
  ARRAY['Bodyweight Squat', 'Air Squat'],
  'compound',
  'legs',
  'bodyweight',
  '[{"muscle": "Quadriceps", "activation": 70}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 60}, {"muscle": "Hamstrings", "activation": 30}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Squat' AND equipment = 'barbell'),
  0.3,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Squat' AND equipment = 'bodyweight');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Pike Push Up',
  ARRAY[]::text[],
  'compound',
  'push',
  'bodyweight',
  '[{"muscle": "Anterior Deltoid", "activation": 75}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 55}, {"muscle": "Upper Pectoralis", "activation": 40}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Overhead Press'),
  0.4,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Pike Push Up');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Handstand Push Up',
  ARRAY[]::text[],
  'compound',
  'push',
  'bodyweight',
  '[{"muscle": "Anterior Deltoid", "activation": 80}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 50}, {"muscle": "Upper Pectoralis", "activation": 35}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Overhead Press'),
  0.6,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Handstand Push Up');

-- Compound (Cable) - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Cable Pull Through',
  ARRAY[]::text[],
  'compound',
  'pull',
  'cable',
  '[{"muscle": "Gluteus Maximus", "activation": 75}]'::jsonb,
  '[{"muscle": "Hamstrings", "activation": 60}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Hip Thrust'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Cable Pull Through');

-- Isolation Arms (Dumbbell) - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Concentration Curl',
  ARRAY[]::text[],
  'isolation',
  'pull',
  'dumbbell',
  '[{"muscle": "Biceps Brachii", "activation": 90}]'::jsonb,
  '[{"muscle": "Brachialis", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bicep Curl'),
  0.85,
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Concentration Curl');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Preacher Curl',
  ARRAY[]::text[],
  'isolation',
  'pull',
  'dumbbell',
  '[{"muscle": "Biceps Brachii", "activation": 90}]'::jsonb,
  '[{"muscle": "Brachialis", "activation": 45}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bicep Curl'),
  0.95,
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Preacher Curl');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Incline Curl',
  ARRAY[]::text[],
  'isolation',
  'pull',
  'dumbbell',
  '[{"muscle": "Biceps Brachii (Long Head)", "activation": 90}]'::jsonb,
  '[{"muscle": "Brachialis", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bicep Curl'),
  0.9,
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Incline Curl');

-- Isolation Legs (Dumbbell) - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Goblet Squat',
  ARRAY[]::text[],
  'compound',
  'legs',
  'dumbbell',
  '[{"muscle": "Quadriceps", "activation": 80}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 60}, {"muscle": "Core", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Squat'),
  0.75,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Goblet Squat');

-- Kettlebell - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Kettlebell Swing',
  ARRAY['KB Swing'],
  'compound',
  'pull',
  'kettlebell',
  '[{"muscle": "Gluteus Maximus", "activation": 75}]'::jsonb,
  '[{"muscle": "Hamstrings", "activation": 60}, {"muscle": "Erector Spinae", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Hip Thrust'),
  0.8,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Kettlebell Swing');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Kettlebell Press',
  ARRAY['KB Press'],
  'compound',
  'push',
  'kettlebell',
  '[{"muscle": "Anterior Deltoid", "activation": 70}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 45}, {"muscle": "Upper Pectoralis", "activation": 35}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Overhead Press'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Kettlebell Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Kettlebell Goblet Squat',
  ARRAY['KB Goblet Squat'],
  'compound',
  'legs',
  'kettlebell',
  '[{"muscle": "Quadriceps", "activation": 80}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 55}, {"muscle": "Core", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Squat'),
  0.8,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Kettlebell Goblet Squat');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Kettlebell Row',
  ARRAY['KB Row'],
  'compound',
  'pull',
  'kettlebell',
  '[{"muscle": "Latissimus Dorsi", "activation": 75}]'::jsonb,
  '[{"muscle": "Rhomboids", "activation": 55}, {"muscle": "Biceps Brachii", "activation": 45}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Barbell Row'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Kettlebell Row');

-- Band Exercises - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Band Chest Press',
  ARRAY[]::text[],
  'compound',
  'push',
  'band',
  '[{"muscle": "Pectoralis Major", "activation": 70}]'::jsonb,
  '[{"muscle": "Anterior Deltoid", "activation": 45}, {"muscle": "Triceps Brachii", "activation": 35}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Bench Press'),
  0.4,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Band Chest Press');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Band Squat',
  ARRAY[]::text[],
  'compound',
  'legs',
  'band',
  '[{"muscle": "Quadriceps", "activation": 70}]'::jsonb,
  '[{"muscle": "Gluteus Maximus", "activation": 60}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Squat'),
  0.4,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Band Squat');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Band Deadlift',
  ARRAY[]::text[],
  'compound',
  'pull',
  'band',
  '[{"muscle": "Gluteus Maximus", "activation": 70}]'::jsonb,
  '[{"muscle": "Hamstrings", "activation": 60}, {"muscle": "Erector Spinae", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Deadlift'),
  0.3,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Band Deadlift');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Band Good Morning',
  ARRAY[]::text[],
  'compound',
  'pull',
  'band',
  '[{"muscle": "Erector Spinae", "activation": 70}]'::jsonb,
  '[{"muscle": "Hamstrings", "activation": 60}, {"muscle": "Gluteus Maximus", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Romanian Deadlift'),
  0.5,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Band Good Morning');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Band Hip Thrust',
  ARRAY[]::text[],
  'compound',
  'legs',
  'band',
  '[{"muscle": "Gluteus Maximus", "activation": 85}]'::jsonb,
  '[{"muscle": "Hamstrings", "activation": 40}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Hip Thrust'),
  0.6,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Band Hip Thrust');

-- Assisted Exercises - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Assisted Pull Up',
  ARRAY['Machine Pull Up'],
  'compound',
  'pull',
  'machine',
  '[{"muscle": "Latissimus Dorsi", "activation": 80}]'::jsonb,
  '[{"muscle": "Biceps Brachii", "activation": 50}, {"muscle": "Trapezius (Lower)", "activation": 40}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Pull Up'),
  0.7,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Assisted Pull Up');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Assisted Dip',
  ARRAY['Machine Dip'],
  'compound',
  'push',
  'machine',
  '[{"muscle": "Triceps Brachii", "activation": 65}]'::jsonb,
  '[{"muscle": "Pectoralis Major (Lower)", "activation": 55}, {"muscle": "Anterior Deltoid", "activation": 45}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Dip'),
  0.7,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Assisted Dip');

-- Accessory Exercises - with base_exercise
INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Chest Supported Row',
  ARRAY[]::text[],
  'compound',
  'pull',
  'dumbbell',
  '[{"muscle": "Latissimus Dorsi", "activation": 80}]'::jsonb,
  '[{"muscle": "Rhomboids", "activation": 60}, {"muscle": "Biceps Brachii", "activation": 45}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Barbell Row'),
  0.8,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Chest Supported Row');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Single Arm Row',
  ARRAY[]::text[],
  'compound',
  'pull',
  'dumbbell',
  '[{"muscle": "Latissimus Dorsi", "activation": 80}]'::jsonb,
  '[{"muscle": "Rhomboids", "activation": 55}, {"muscle": "Biceps Brachii", "activation": 50}]'::jsonb,
  'increase',
  (SELECT id FROM exercise_library WHERE name = 'Barbell Row'),
  0.85,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Single Arm Row');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Neutral Grip Pull Up',
  ARRAY[]::text[],
  'compound',
  'pull',
  'bodyweight',
  '[{"muscle": "Latissimus Dorsi", "activation": 80}]'::jsonb,
  '[{"muscle": "Biceps Brachii", "activation": 60}, {"muscle": "Trapezius (Lower)", "activation": 40}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Pull Up'),
  1.1,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Neutral Grip Pull Up');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Wide Grip Pull Up',
  ARRAY[]::text[],
  'compound',
  'pull',
  'bodyweight',
  '[{"muscle": "Latissimus Dorsi", "activation": 85}]'::jsonb,
  '[{"muscle": "Trapezius (Lower)", "activation": 50}, {"muscle": "Rhomboids", "activation": 40}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Pull Up'),
  0.9,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Wide Grip Pull Up');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Diamond Push Up',
  ARRAY[]::text[],
  'compound',
  'push',
  'bodyweight',
  '[{"muscle": "Triceps Brachii", "activation": 70}]'::jsonb,
  '[{"muscle": "Pectoralis Major", "activation": 55}, {"muscle": "Anterior Deltoid", "activation": 40}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Push Up'),
  0.85,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Diamond Push Up');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Wide Grip Push Up',
  ARRAY[]::text[],
  'compound',
  'push',
  'bodyweight',
  '[{"muscle": "Pectoralis Major", "activation": 80}]'::jsonb,
  '[{"muscle": "Anterior Deltoid", "activation": 45}, {"muscle": "Triceps Brachii", "activation": 35}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Push Up'),
  0.9,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Wide Grip Push Up');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Decline Push Up',
  ARRAY[]::text[],
  'compound',
  'push',
  'bodyweight',
  '[{"muscle": "Pectoralis Major (Lower)", "activation": 85}]'::jsonb,
  '[{"muscle": "Triceps Brachii", "activation": 50}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Push Up'),
  1.05,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Decline Push Up');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Incline Push Up',
  ARRAY[]::text[],
  'compound',
  'push',
  'bodyweight',
  '[{"muscle": "Pectoralis Major (Clavicular)", "activation": 85}]'::jsonb,
  '[{"muscle": "Anterior Deltoid", "activation": 55}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Push Up'),
  0.9,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Incline Push Up');

INSERT INTO exercise_library (name, aliases, category, movement_type, equipment, primary_muscles, secondary_muscles, weight_direction, base_exercise_id, equivalency_ratio, uses_rpe, uses_rir)
SELECT
  'Glute Bridge',
  ARRAY[]::text[],
  'accessory',
  'legs',
  'bodyweight',
  '[{"muscle": "Gluteus Maximus", "activation": 85}]'::jsonb,
  '[{"muscle": "Hamstrings", "activation": 35}]'::jsonb,
  'decrease',
  (SELECT id FROM exercise_library WHERE name = 'Hip Thrust'),
  0.4,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM exercise_library WHERE name = 'Glute Bridge');
