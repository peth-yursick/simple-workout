import { SupabaseClient } from '@supabase/supabase-js'
import { ExerciseCategory, MovementType, EquipmentType } from '@/lib/types/database'

interface ExerciseSeed {
  name: string
  aliases: string[]
  category: ExerciseCategory
  movement_type: MovementType
  equipment: EquipmentType
  primary_muscles: { muscle: string; activation: number }[]
  secondary_muscles: { muscle: string; activation: number }[]
  weight_direction: 'increase' | 'decrease'
  base_exercise?: string
  equivalency_ratio?: number
  uses_rpe: boolean
  uses_rir: boolean
}

export const exerciseSeedData: ExerciseSeed[] = [
  // === COMPOUND PUSH (BARBELL) ===
  {
    name: 'Bench Press',
    aliases: ['Barbell Bench Press', 'Chest Press'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 60 },
      { muscle: 'Triceps Brachii', activation: 45 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Close Grip Bench Press',
    aliases: ['Close-Grip Bench'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 70 },
      { muscle: 'Anterior Deltoid', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Overhead Press',
    aliases: ['Military Press', 'Shoulder Press'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 50 },
      { muscle: 'Upper Pectoralis', activation: 40 },
      { muscle: 'Trapezius', activation: 30 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Incline Bench Press',
    aliases: ['Incline Press'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Pectoralis Major (Clavicular)', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 65 },
      { muscle: 'Triceps Brachii', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Decline Bench Press',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Pectoralis Major (Sternocostal)', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 50 },
      { muscle: 'Anterior Deltoid', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.95,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Front Squat',
    aliases: [],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 },
      { muscle: 'Erector Spinae', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Squat',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Squat',
    aliases: ['Back Squat', 'Barbell Squat'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 70 },
      { muscle: 'Erector Spinae', activation: 60 },
      { muscle: 'Adductor Magnus', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Deadlift',
    aliases: ['Conventional Deadlift'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Erector Spinae', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 70 },
      { muscle: 'Hamstrings', activation: 60 },
      { muscle: 'Trapezius', activation: 50 },
      { muscle: 'Latissimus Dorsi', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Romanian Deadlift',
    aliases: ['RDL'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Hamstrings', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 70 },
      { muscle: 'Erector Spinae', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Deadlift',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Sumo Deadlift',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 65 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 75 },
      { muscle: 'Adductor Magnus', activation: 60 },
      { muscle: 'Erector Spinae', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Deadlift',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Barbell Row',
    aliases: ['Bent Over Row'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 60 },
      { muscle: 'Trapezius (Middle)', activation: 55 },
      { muscle: 'Posterior Deltoid', activation: 50 },
      { muscle: 'Biceps Brachii', activation: 45 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Pendlay Row',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 70 },
      { muscle: 'Trapezius (Middle)', activation: 60 },
      { muscle: 'Posterior Deltoid', activation: 50 },
      { muscle: 'Biceps Brachii', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Barbell Row',
    equivalency_ratio: 0.95,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'T-Bar Row',
    aliases: ['T Bar Row'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 65 },
      { muscle: 'Trapezius (Middle)', activation: 60 },
      { muscle: 'Posterior Deltoid', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Barbell Row',
    equivalency_ratio: 1.05,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Hip Thrust',
    aliases: ['Barbell Hip Thrust'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Gluteus Maximus', activation: 90 }],
    secondary_muscles: [
      { muscle: 'Hamstrings', activation: 45 },
      { muscle: 'Quadriceps', activation: 30 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Lunges',
    aliases: ['Barbell Lunges'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 65 },
      { muscle: 'Hamstrings', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Split Squat',
    aliases: ['Bulgarian Split Squat'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 },
      { muscle: 'Hamstrings', activation: 35 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Lunges',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Good Mornings',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Erector Spinae', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Hamstrings', activation: 65 },
      { muscle: 'Gluteus Maximus', activation: 55 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Romanian Deadlift',
    equivalency_ratio: 0.7,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Standing Press',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 55 },
      { muscle: 'Upper Pectoralis', activation: 35 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Overhead Press',
    equivalency_ratio: 0.95,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Push Press',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 50 },
      { muscle: 'Upper Pectoralis', activation: 30 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Overhead Press',
    equivalency_ratio: 1.1,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Floor Press',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'barbell',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 50 },
      { muscle: 'Anterior Deltoid', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: false
  },

  // === COMPOUND PUSH (DUMBBELL) ===
  {
    name: 'Dumbbell Bench Press',
    aliases: ['DB Bench Press', 'Dumbbell Press'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 55 },
      { muscle: 'Triceps Brachii', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Dumbbell Incline Press',
    aliases: ['DB Incline Press'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Pectoralis Major (Clavicular)', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 60 },
      { muscle: 'Triceps Brachii', activation: 35 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.8,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Dumbbell Shoulder Press',
    aliases: ['DB Shoulder Press', 'Seated Dumbbell Press'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 45 },
      { muscle: 'Upper Pectoralis', activation: 35 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Overhead Press',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Dumbbell Squat',
    aliases: [],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 65 },
      { muscle: 'Erector Spinae', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Squat',
    equivalency_ratio: 0.7,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Dumbbell Lunges',
    aliases: ['DB Lunges'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 65 },
      { muscle: 'Hamstrings', activation: 35 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Lunges',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Dumbbell Romanian Deadlift',
    aliases: ['DB RDL', 'Dumbbell RDL'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Hamstrings', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 65 },
      { muscle: 'Erector Spinae', activation: 45 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Romanian Deadlift',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Dumbbell Row',
    aliases: ['DB Row', 'Single Arm Row'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 60 },
      { muscle: 'Trapezius (Middle)', activation: 55 },
      { muscle: 'Biceps Brachii', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Barbell Row',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Dumbbell Snatch',
    aliases: ['DB Snatch'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 50 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 },
      { muscle: 'Deltoids', activation: 45 },
      { muscle: 'Trapezius', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Dumbbell Thruster',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 60 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 55 },
      { muscle: 'Triceps Brachii', activation: 50 },
      { muscle: 'Pectoralis Major', activation: 45 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Dumbbell Clean',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 55 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 },
      { muscle: 'Deltoids', activation: 40 },
      { muscle: 'Trapezius', activation: 35 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Arnold Press',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Medial Deltoid', activation: 60 },
      { muscle: 'Triceps Brachii', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },

  // === COMPOUND PUSH (MACHINE) ===
  {
    name: 'Chest Press Machine',
    aliases: ['Machine Chest Press', 'Chest Press'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 55 },
      { muscle: 'Triceps Brachii', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Shoulder Press Machine',
    aliases: ['Machine Shoulder Press'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 45 },
      { muscle: 'Medial Deltoid', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Overhead Press',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Leg Press',
    aliases: ['Machine Leg Press'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 65 },
      { muscle: 'Hamstrings', activation: 35 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Squat',
    equivalency_ratio: 1.1,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Hack Squat',
    aliases: [],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Squat',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Leg Extension',
    aliases: [],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 90 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Leg Curl',
    aliases: ['Hamstring Curl'],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Hamstrings', activation: 90 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Seated Cable Row',
    aliases: ['Cable Row'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 60 },
      { muscle: 'Trapezius (Middle)', activation: 55 },
      { muscle: 'Biceps Brachii', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Barbell Row',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Lat Pulldown',
    aliases: ['Lat Pulldown', 'Pulldown'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Trapezius (Lower)', activation: 40 },
      { muscle: 'Biceps Brachii', activation: 35 },
      { muscle: 'Rhomboids', activation: 30 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Chest Fly Machine',
    aliases: ['Pec Deck', 'Machine Fly'],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 35 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Lateral Raise Machine',
    aliases: ['Machine Lateral Raise'],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Medial Deltoid', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Trapezius (Middle)', activation: 30 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Rear Delt Machine',
    aliases: ['Reverse Pec Deck', 'Rear Delt Fly'],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Posterior Deltoid', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 40 },
      { muscle: 'Trapezius (Middle)', activation: 35 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Calf Raise Machine',
    aliases: ['Standing Calf Raise'],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Gastrocnemius', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Soleus', activation: 50 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Seated Calf Raise',
    aliases: [],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Soleus', activation: 85 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Abductor Machine',
    aliases: [],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Gluteus Medius', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Tensor Fasciae Latae', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Adductor Machine',
    aliases: [],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Adductor Magnus', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Adductor Longus', activation: 70 },
      { muscle: 'Adductor Brevis', activation: 60 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Smith Machine Squat',
    aliases: ['Smith Squat'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 65 },
      { muscle: 'Erector Spinae', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Squat',
    equivalency_ratio: 0.95,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Smith Machine Bench Press',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 60 },
      { muscle: 'Triceps Brachii', activation: 45 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.95,
    uses_rpe: true,
    uses_rir: false
  },

  // === COMPOUND (BODYWEIGHT) ===
  {
    name: 'Pull Up',
    aliases: ['Pullup', 'Chin Up'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Trapezius (Lower)', activation: 55 },
      { muscle: 'Biceps Brachii', activation: 50 },
      { muscle: 'Rhomboids', activation: 45 }
    ],
    weight_direction: 'decrease',
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Chin Up',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Biceps Brachii', activation: 70 },
      { muscle: 'Trapezius (Lower)', activation: 45 },
      { muscle: 'Rhomboids', activation: 40 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Pull Up',
    equivalency_ratio: 1.1,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Push Up',
    aliases: ['Pushup'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 50 },
      { muscle: 'Anterior Deltoid', activation: 45 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.5,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Dip',
    aliases: ['Chest Dip', 'Tricep Dip'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Triceps Brachii', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Pectoralis Major (Lower)', activation: 60 },
      { muscle: 'Anterior Deltoid', activation: 50 }
    ],
    weight_direction: 'decrease',
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Squat',
    aliases: ['Bodyweight Squat', 'Air Squat'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 },
      { muscle: 'Hamstrings', activation: 30 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Squat',
    equivalency_ratio: 0.3,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Pistol Squat',
    aliases: ['Single Leg Squat'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 }
    ],
    weight_direction: 'decrease',
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Lunge',
    aliases: ['Bodyweight Lunge'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 65 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 },
      { muscle: 'Hamstrings', activation: 30 }
    ],
    weight_direction: 'decrease',
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Pike Push Up',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 55 },
      { muscle: 'Upper Pectoralis', activation: 40 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Overhead Press',
    equivalency_ratio: 0.4,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Handstand Push Up',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 50 },
      { muscle: 'Upper Pectoralis', activation: 35 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Overhead Press',
    equivalency_ratio: 0.6,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Burpee',
    aliases: [],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 60 }],
    secondary_muscles: [
      { muscle: 'Pectoralis Major', activation: 45 },
      { muscle: 'Gluteus Maximus', activation: 40 }
    ],
    weight_direction: 'decrease',
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Muscle Up',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 60 },
      { muscle: 'Pectoralis Major', activation: 50 }
    ],
    weight_direction: 'decrease',
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Plank',
    aliases: ['Front Plank'],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Rectus Abdominis', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Transverse Abdominis', activation: 60 },
      { muscle: 'Obliques', activation: 40 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Side Plank',
    aliases: [],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Obliques', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Quadratus Lumborum', activation: 40 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },

  // === COMPOUND (CABLE) ===
  {
    name: 'Cable Fly',
    aliases: ['Cable Crossover', 'Chest Fly'],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 35 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Face Pull',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Posterior Deltoid', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 50 },
      { muscle: 'Trapezius (Middle)', activation: 45 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Tricep Pushdown',
    aliases: ['Tricep Pushdown', 'Cable Tricep Extension'],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Triceps Brachii', activation: 90 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Cable Curl',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Biceps Brachii', activation: 90 }],
    secondary_muscles: [
      { muscle: 'Brachialis', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Cable Kickback',
    aliases: ['Tricep Kickback'],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Triceps Brachii', activation: 85 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Cable Crunch',
    aliases: [],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Rectus Abdominis', activation: 80 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Cable Woodchop',
    aliases: [],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Obliques', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Rectus Abdominis', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Cable Pull Through',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Gluteus Maximus', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Hamstrings', activation: 60 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Hip Thrust',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Straight Arm Pulldown',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Trapezius (Lower)', activation: 40 },
      { muscle: 'Pectoralis Major', activation: 30 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Cable Lateral Raise',
    aliases: [],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Medial Deltoid', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Trapezius (Middle)', activation: 30 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Cable Rear Delt Fly',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'cable',
    primary_muscles: [{ muscle: 'Posterior Deltoid', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },

  // === ISOLATION ARMS (DUMBBELL) ===
  {
    name: 'Bicep Curl',
    aliases: ['Dumbbell Curl', 'DB Curl'],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Biceps Brachii', activation: 90 }],
    secondary_muscles: [
      { muscle: 'Brachialis', activation: 50 },
      { muscle: 'Brachioradialis', activation: 30 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Hammer Curl',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Brachialis', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Brachioradialis', activation: 65 },
      { muscle: 'Biceps Brachii', activation: 55 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Concentration Curl',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Biceps Brachii', activation: 90 }],
    secondary_muscles: [
      { muscle: 'Brachialis', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bicep Curl',
    equivalency_ratio: 0.85,
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Preacher Curl',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Biceps Brachii', activation: 90 }],
    secondary_muscles: [
      { muscle: 'Brachialis', activation: 45 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bicep Curl',
    equivalency_ratio: 0.95,
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Incline Curl',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Biceps Brachii (Long Head)', activation: 90 }],
    secondary_muscles: [
      { muscle: 'Brachialis', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bicep Curl',
    equivalency_ratio: 0.9,
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Tricep Extension',
    aliases: ['Dumbbell Tricep Extension', 'DB Tricep Extension'],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Triceps Brachii', activation: 90 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Overhead Tricep Extension',
    aliases: ['DB Overhead Extension'],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Triceps Brachii (Long Head)', activation: 90 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Skull Crusher',
    aliases: [],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Triceps Brachii', activation: 90 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Reverse Curl',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Brachioradialis', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Brachialis', activation: 55 },
      { muscle: 'Biceps Brachii', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Wrist Curl',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Wrist Flexors', activation: 90 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },

  // === ISOLATION SHOULDERS (DUMBBELL) ===
  {
    name: 'Lateral Raise',
    aliases: ['Side Raise', 'DB Lateral Raise'],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Medial Deltoid', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Trapezius (Middle)', activation: 35 },
      { muscle: 'Supraspinatus', activation: 30 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Front Raise',
    aliases: [],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Pectoralis Major (Clavicular)', activation: 35 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Rear Delt Fly',
    aliases: ['Rear Delt Raise', 'Reverse Fly'],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Posterior Deltoid', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 45 },
      { muscle: 'Trapezius (Middle)', activation: 35 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Shrug',
    aliases: ['DB Shrug', 'Dumbbell Shrug'],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Trapezius (Upper)', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Levator Scapulae', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Upright Row',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Trapezius (Middle)', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Medial Deltoid', activation: 65 },
      { muscle: 'Biceps Brachii', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },

  // === ISOLATION LEGS (DUMBBELL) ===
  {
    name: 'Goblet Squat',
    aliases: [],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 },
      { muscle: 'Core', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Squat',
    equivalency_ratio: 0.75,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Bulgarian Split Squat',
    aliases: [],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Step Up',
    aliases: [],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Calf Raise',
    aliases: ['DB Calf Raise', 'Dumbbell Calf Raise'],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Gastrocnemius', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Soleus', activation: 45 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Seated Calf Raise',
    aliases: [],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Soleus', activation: 85 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },

  // === ISOLATION CORE ===
  {
    name: 'Crunch',
    aliases: ['Ab Crunch', 'Sit Up'],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Rectus Abdominis', activation: 85 }],
    secondary_muscles: [],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Leg Raise',
    aliases: ['Hanging Leg Raise', 'Leg Lift'],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Rectus Abdominis', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Hip Flexors', activation: 50 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Russian Twist',
    aliases: [],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Obliques', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Rectus Abdominis', activation: 40 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Mountain Climber',
    aliases: [],
    category: 'compound',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Rectus Abdominis', activation: 60 }],
    secondary_muscles: [
      { muscle: 'Hip Flexors', activation: 50 },
      { muscle: 'Obliques', activation: 40 }
    ],
    weight_direction: 'decrease',
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Dead Bug',
    aliases: [],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Transverse Abdominis', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Rectus Abdominis', activation: 50 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Bird Dog',
    aliases: [],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Erector Spinae', activation: 60 }],
    secondary_muscles: [
      { muscle: 'Transverse Abdominis', activation: 55 },
      { muscle: 'Gluteus Maximus', activation: 40 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Superman',
    aliases: [],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Erector Spinae', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 50 },
      { muscle: 'Hamstrings', activation: 30 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Hollow Body Hold',
    aliases: [],
    category: 'isolation',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Transverse Abdominis', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Rectus Abdominis', activation: 50 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },

  // === KETTLEBELL ===
  {
    name: 'Kettlebell Swing',
    aliases: ['KB Swing'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'kettlebell',
    primary_muscles: [{ muscle: 'Gluteus Maximus', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Hamstrings', activation: 60 },
      { muscle: 'Erector Spinae', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Hip Thrust',
    equivalency_ratio: 0.8,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Kettlebell Snatch',
    aliases: ['KB Snatch'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'kettlebell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 55 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 },
      { muscle: 'Deltoids', activation: 45 },
      { muscle: 'Trapezius', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Kettlebell Clean',
    aliases: ['KB Clean'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'kettlebell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 50 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 65 },
      { muscle: 'Deltoids', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Kettlebell Press',
    aliases: ['KB Press'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'kettlebell',
    primary_muscles: [{ muscle: 'Anterior Deltoid', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 45 },
      { muscle: 'Upper Pectoralis', activation: 35 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Overhead Press',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Turkish Get Up',
    aliases: ['TGU', 'KB Get Up'],
    category: 'compound',
    movement_type: 'core',
    equipment: 'kettlebell',
    primary_muscles: [{ muscle: 'Core', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Deltoids', activation: 45 },
      { muscle: 'Gluteus Maximus', activation: 40 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Kettlebell Goblet Squat',
    aliases: ['KB Goblet Squat'],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'kettlebell',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 55 },
      { muscle: 'Core', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Squat',
    equivalency_ratio: 0.8,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Kettlebell Row',
    aliases: ['KB Row'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'kettlebell',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 55 },
      { muscle: 'Biceps Brachii', activation: 45 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Barbell Row',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },

  // === BAND EXERCISES ===
  {
    name: 'Band Pull Apart',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Posterior Deltoid', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 50 },
      { muscle: 'Trapezius (Middle)', activation: 45 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Band Face Pull',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Posterior Deltoid', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 45 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Band Lateral Raise',
    aliases: [],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Medial Deltoid', activation: 80 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Band Chest Press',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 45 },
      { muscle: 'Triceps Brachii', activation: 35 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Bench Press',
    equivalency_ratio: 0.4,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Band Squat',
    aliases: [],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 60 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Squat',
    equivalency_ratio: 0.4,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Band Deadlift',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Gluteus Maximus', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Hamstrings', activation: 60 },
      { muscle: 'Erector Spinae', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Deadlift',
    equivalency_ratio: 0.3,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Band Tricep Pushdown',
    aliases: [],
    category: 'isolation',
    movement_type: 'push',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Triceps Brachii', activation: 85 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Band Bicep Curl',
    aliases: [],
    category: 'isolation',
    movement_type: 'pull',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Biceps Brachii', activation: 85 }],
    secondary_muscles: [],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Band Good Morning',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Erector Spinae', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Hamstrings', activation: 60 },
      { muscle: 'Gluteus Maximus', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Romanian Deadlift',
    equivalency_ratio: 0.5,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Band Hip Thrust',
    aliases: [],
    category: 'compound',
    movement_type: 'legs',
    equipment: 'band',
    primary_muscles: [{ muscle: 'Gluteus Maximus', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Hamstrings', activation: 40 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Hip Thrust',
    equivalency_ratio: 0.6,
    uses_rpe: true,
    uses_rir: false
  },

  // === ASSISTED EXERCISES (WEIGHT DECREASE) ===
  {
    name: 'Assisted Pull Up',
    aliases: ['Machine Pull Up'],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Biceps Brachii', activation: 50 },
      { muscle: 'Trapezius (Lower)', activation: 40 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Pull Up',
    equivalency_ratio: 0.7,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Assisted Dip',
    aliases: ['Machine Dip'],
    category: 'compound',
    movement_type: 'push',
    equipment: 'machine',
    primary_muscles: [{ muscle: 'Triceps Brachii', activation: 65 }],
    secondary_muscles: [
      { muscle: 'Pectoralis Major (Lower)', activation: 55 },
      { muscle: 'Anterior Deltoid', activation: 45 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Dip',
    equivalency_ratio: 0.7,
    uses_rpe: true,
    uses_rir: true
  },

  // === ACCESSORY EXERCISES ===
  {
    name: 'Farmer Walk',
    aliases: [],
    category: 'accessory',
    movement_type: 'core',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Trapezius (Upper)', activation: 60 }],
    secondary_muscles: [
      { muscle: 'Forearms', activation: 55 },
      { muscle: 'Core', activation: 45 }
    ],
    weight_direction: 'increase',
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Farmers Hold',
    aliases: [],
    category: 'accessory',
    movement_type: 'core',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Forearms', activation: 65 }],
    secondary_muscles: [
      { muscle: 'Trapezius (Upper)', activation: 50 }
    ],
    weight_direction: 'increase',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Chest Supported Row',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 60 },
      { muscle: 'Biceps Brachii', activation: 45 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Barbell Row',
    equivalency_ratio: 0.8,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Single Arm Row',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'dumbbell',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Rhomboids', activation: 55 },
      { muscle: 'Biceps Brachii', activation: 50 }
    ],
    weight_direction: 'increase',
    base_exercise: 'Barbell Row',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: false
  },
  {
    name: 'Neutral Grip Pull Up',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Biceps Brachii', activation: 60 },
      { muscle: 'Trapezius (Lower)', activation: 40 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Pull Up',
    equivalency_ratio: 1.1,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Wide Grip Pull Up',
    aliases: [],
    category: 'compound',
    movement_type: 'pull',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Latissimus Dorsi', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Trapezius (Lower)', activation: 50 },
      { muscle: 'Rhomboids', activation: 40 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Pull Up',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Diamond Push Up',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Triceps Brachii', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Pectoralis Major', activation: 55 },
      { muscle: 'Anterior Deltoid', activation: 40 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Push Up',
    equivalency_ratio: 0.85,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Wide Grip Push Up',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Pectoralis Major', activation: 80 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 45 },
      { muscle: 'Triceps Brachii', activation: 35 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Push Up',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Decline Push Up',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Pectoralis Major (Lower)', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Triceps Brachii', activation: 50 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Push Up',
    equivalency_ratio: 1.05,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Incline Push Up',
    aliases: [],
    category: 'compound',
    movement_type: 'push',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Pectoralis Major (Clavicular)', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Anterior Deltoid', activation: 55 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Push Up',
    equivalency_ratio: 0.9,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Sissy Squat',
    aliases: [],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Quadriceps', activation: 85 }],
    secondary_muscles: [],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Nordic Curl',
    aliases: [],
    category: 'isolation',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Hamstrings', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Gluteus Maximus', activation: 40 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Glute Bridge',
    aliases: [],
    category: 'accessory',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Gluteus Maximus', activation: 85 }],
    secondary_muscles: [
      { muscle: 'Hamstrings', activation: 35 }
    ],
    weight_direction: 'decrease',
    base_exercise: 'Hip Thrust',
    equivalency_ratio: 0.4,
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Fire Hydrant',
    aliases: ['Quadruped Hip Abduction'],
    category: 'accessory',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Gluteus Medius', activation: 80 }],
    secondary_muscles: [],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Clamshell',
    aliases: [],
    category: 'accessory',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Gluteus Medius', activation: 85 }],
    secondary_muscles: [],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Donkey Kick',
    aliases: [],
    category: 'accessory',
    movement_type: 'legs',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Gluteus Maximus', activation: 80 }],
    secondary_muscles: [],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  },
  {
    name: 'Bear Crawl',
    aliases: [],
    category: 'accessory',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Core', activation: 70 }],
    secondary_muscles: [
      { muscle: 'Deltoids', activation: 45 },
      { muscle: 'Hip Flexors', activation: 40 }
    ],
    weight_direction: 'decrease',
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'Crab Walk',
    aliases: [],
    category: 'accessory',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Triceps Brachii', activation: 60 }],
    secondary_muscles: [
      { muscle: 'Deltoids', activation: 40 },
      { muscle: 'Core', activation: 35 }
    ],
    weight_direction: 'decrease',
    uses_rpe: true,
    uses_rir: true
  },
  {
    name: 'L Sit',
    aliases: [],
    category: 'accessory',
    movement_type: 'core',
    equipment: 'bodyweight',
    primary_muscles: [{ muscle: 'Rectus Abdominis', activation: 75 }],
    secondary_muscles: [
      { muscle: 'Hip Flexors', activation: 50 }
    ],
    weight_direction: 'decrease',
    uses_rpe: false,
    uses_rir: true
  }
]

export async function seedExerciseLibrary(supabase: SupabaseClient): Promise<void> {
  // First, get all existing exercises to avoid duplicates
  const { data: existing } = await supabase
    .from('exercise_library')
    .select('name')

  const existingNames = new Set(existing?.map(e => e.name) || [])

  // Filter out exercises that already exist
  const toInsert = exerciseSeedData.filter(exercise => !existingNames.has(exercise.name))

  if (toInsert.length === 0) {
    console.log('No new exercises to insert')
    return
  }

  // Resolve base_exercise references
  const nameToId = new Map<string, string>()

  // First pass: insert exercises without base_exercise references
  const exercisesWithoutBase = toInsert.filter(ex => !ex.base_exercise)

  for (const exercise of exercisesWithoutBase) {
    const { data, error } = await supabase
      .from('exercise_library')
      .insert({
        name: exercise.name,
        aliases: exercise.aliases,
        category: exercise.category,
        movement_type: exercise.movement_type,
        equipment: exercise.equipment,
        primary_muscles: exercise.primary_muscles,
        secondary_muscles: exercise.secondary_muscles,
        weight_direction: exercise.weight_direction,
        base_exercise_id: null,
        equivalency_ratio: exercise.equivalency_ratio ?? 1.0,
        uses_rpe: exercise.uses_rpe,
        uses_rir: exercise.uses_rir
      })
      .select('id')
      .single()

    if (!error && data) {
      nameToId.set(exercise.name, data.id)
    }
  }

  // Second pass: insert exercises with base_exercise references
  const exercisesWithBase = toInsert.filter(ex => ex.base_exercise)

  for (const exercise of exercisesWithBase) {
    const baseId = nameToId.get(exercise.base_exercise!)
    if (!baseId) continue

    const { error } = await supabase
      .from('exercise_library')
      .insert({
        name: exercise.name,
        aliases: exercise.aliases,
        category: exercise.category,
        movement_type: exercise.movement_type,
        equipment: exercise.equipment,
        primary_muscles: exercise.primary_muscles,
        secondary_muscles: exercise.secondary_muscles,
        weight_direction: exercise.weight_direction,
        base_exercise_id: baseId,
        equivalency_ratio: exercise.equivalency_ratio ?? 1.0,
        uses_rpe: exercise.uses_rpe,
        uses_rir: exercise.uses_rir
      })

    if (!error) {
      const { data } = await supabase
        .from('exercise_library')
        .select('id')
        .eq('name', exercise.name)
        .single()

      if (data) {
        nameToId.set(exercise.name, data.id)
      }
    }
  }

  console.log(`Inserted ${toInsert.length} exercises into library`)
}
