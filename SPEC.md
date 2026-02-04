````markdown
## Progressive Overload Workout Tracker - Complete Technical Specification

---

## 1. Core Data Models

### User
```typescript
{
  id: uuid
  email: string
  display_name: string
  auth_provider: 'google' | 'apple'
  created_at: timestamp
  current_week: integer
  current_level: integer
  level_progress: float // 0-100, increments per exercise weight increase
}
````

### Workout

```typescript
{
  id: uuid
  user_id: uuid (foreign key)
  week_number: integer
  day_number: integer (1-3)
  day_name: string // "Day 1", "Day 2", "Day 3"
  created_at: timestamp
  completed_at: timestamp | null
}
```

### Exercise

```typescript
{
  id: uuid
  workout_id: uuid (foreign key)
  name: string
  order: integer
  sets: integer // max 9
  weight_kg: float // max 500kg
  rep_min: integer
  rep_max: integer
  target_effort_min: integer // 70% default
  target_effort_max: integer // 80% default
  status: 'incomplete' | 'complete' | 'skipped'
  created_at: timestamp
}
```

### ExerciseSet

```typescript
{
  id: uuid
  exercise_id: uuid (foreign key)
  set_number: integer
  reps_completed: integer | null
  effort_percentage: integer | null // 0-100
  skipped: boolean
  completed_at: timestamp | null
}
```

### WeightRecommendation

```typescript
{
  id: uuid
  user_id: uuid (foreign key)
  week_number: integer
  exercises: jsonb // Array of {exercise_id, exercise_name, current_weight, recommendation}
  dismissed: boolean
  created_at: timestamp
}
```

---

## 2. UI Architecture

### Screen Hierarchy

```
/auth                → OAuth login
/                    → Home (Week/Day selector)
/workout/:id         → Day exercise list
/exercise/:id        → Single exercise tracking
/finish              → Completion screen
```

### Auth Screen (`/auth`)

**Layout:**

- Dark background
- Centered card
- App logo/name
- Two buttons:
    - "Sign in with Google"
    - "Sign in with Apple"

**Business Logic:**

- Redirect authenticated users to `/`
- On successful auth:
    - Create user record if new
    - Seed Week 1 workouts with default exercises
    - Redirect to `/`

---

### Home Screen (`/`)

**Layout:**

- Header: "Week {N}"
- Level progress bar (below header, thin horizontal, fills 0-100%)
- Three cards stacked vertically:
    - Day 1
    - Day 2
    - Day 3
- Each card shows:
    - Day name
    - Completion icon (✓ if all exercises complete, empty otherwise)
    - Tap to navigate

**State:**

- Fetch `user.current_week`
- Create workout records if missing for current week
- Calculate level progress from `user.level_progress`

---

### Workout Day Screen (`/workout/:id`)

**Layout:**

- Header: "Day {N}"
- Exercise list (scrollable):
    - Exercise name
    - Sets × Weight kg
    - Target: {rep_min}-{rep_max} reps @ {effort_min}-{effort_max}%
    - Progress: {completed_sets}/{total_sets}
    - Status indicator (right):
        - Green checkmark if `status = 'complete'`
        - Red X if `status = 'skipped'`
        - Empty if `status = 'incomplete'`
- Bottom fixed:
    - "Start" button (visible until first set logged)
    - "+" button (bottom right)

**Interactions:**

- Tap exercise → navigate to `/exercise/:id`
- Tap "Start" → navigate to first incomplete exercise
- Press and hold exercise → drag to reorder (update `order` on drop)
- Hold exercise → modal: "Edit Name" | "Delete"
- Tap "+" → modal:
    - Input: Exercise name
    - Input: Sets (default 3, max 9)
    - Input: Weight kg (dropdown, 0.5kg increments, 2.5-500kg)
    - Input: Rep min (default 6)
    - Input: Rep max (default 8)
    - Input: Effort min % (default 70)
    - Input: Effort max % (default 80)

**Business Logic:**

- New exercises append to end (max `order` + 1)
- Delete removes exercise + all sets
- "Start" disappears after any set logged

---

### Exercise Tracking Screen (`/exercise/:id`)

**Layout:**

- Header: Exercise name (tap to edit)
- Weight display: "{weight_kg} kg" (tap to open dropdown)
- Target display: "{rep_min}-{rep_max} reps @ {effort_min}-{effort_max}%"
- Set tracker:
    - Set {N}: Reps input + Effort % (number + slider)
    - Completed sets show values with checkmark
    - Current set highlighted
- Weight recommendation (if applicable):
    - "Consider increasing weight" (amber)
    - "Increase weight recommended" (green)
- Bottom fixed:
    - "← Back" (left)
    - "Skip" (center, secondary)
    - "Next →" | "Finish" (right, disabled until set logged)

**Effort Input:**

- Large number display (center, above slider)
- Tap number → keyboard input (0-100)
- Slider below → updates number real-time

**Interactions:**

- Tap weight → dropdown (0.5kg increments, 2.5-500kg)
- Enter reps → number input (0-50)
- Tap "Next":
    - If set incomplete → disabled
    - If more sets in exercise → next set
    - If exercise complete → navigate to next incomplete or finish
- Tap "Back" → previous exercise or workout list
- Tap "Skip":
    - Mark exercise `status = 'skipped'`
    - Mark all incomplete sets `skipped = true`
    - Navigate to next incomplete or finish

**Business Logic - Weight Recommendation:**

```typescript
let score = 0;
sets.forEach(set => {
  if (set.reps_completed >= exercise.rep_max && 
      set.effort_percentage <= exercise.target_effort_min) {
    score += 1;
  } else if (set.reps_completed >= exercise.rep_max) {
    score += 0.5;
  }
});

if (score >= sets.length) return 'recommended';
if (score >= sets.length * 0.6) return 'consider';
return 'none';
```

**Business Logic - Level Progress:**

```typescript
// When user manually increases weight:
const increment = 100 / total_exercises_in_week;
user.level_progress += increment;

if (user.level_progress >= 100) {
  user.current_level += 1;
  user.level_progress = 0;
}
```

---

### Finish Screen (`/finish`)

**Layout:**

- Confetti animation (canvas particles, 3s)
- Center card:
    - Random message from pool
    - "Week {N}, Day {D} complete"
    - "Level {N}"
    - Progress bar to next level
    - "Continue" button → home

**Confetti Messages (random):**

- "Excellent work!"
- "Crushing it!"
- "Beast mode!"
- "Consistency wins!"
- "Another one down!"

**Triggers:**

- All exercises in workout have `status = 'complete' | 'skipped'`

**Business Logic:**

- Mark workout `completed_at`
- If all 3 days complete → increment `user.current_week`

---

### Week Transition Modal

**Trigger:**

- Day 3 completion + all 3 days complete in week

**Layout:**

- Overlay modal (dark, centered)
- "Week {N} Complete"
- "Ready for Week {N+1}?"
- If recommendations exist:
    - "Recommended weight increases:"
    - List: "{name}: {old}kg → {new}kg"
- Button: "Start Week {N+1}"

**Business Logic:**

```typescript
// On Day 3 completion:
1. Analyze week for recommendations
2. Create WeightRecommendation if any qualify
3. Show modal
4. On confirm:
   - Duplicate Week N workouts → Week N+1
   - Apply recommended weight increases
   - Increment user.current_week
   - Navigate home
```

**Recommendation Eligibility (per exercise, all 3 days):**

```typescript
// All sets maxed reps at target effort:
if (all_completed_sets.every(set => 
  set.reps_completed >= exercise.rep_max &&
  set.effort_percentage >= exercise.target_effort_min &&
  set.effort_percentage <= exercise.target_effort_max
)):
  recommendation = 'recommended'

// 60%+ sets maxed reps at low effort:
else if (completed_sets.filter(set =>
  set.reps_completed >= exercise.rep_max &&
  set.effort_percentage <= exercise.target_effort_min
).length >= total_sets * 0.6):
  recommendation = 'consider'
```

---

## 3. Default Exercise Templates

**Seed on new user registration:**

**Day 1:**

1. Stiff leg deadlift: 3 sets, 40kg, 6-8 reps, 70-80% effort
2. Wide grip row: 3 sets, 20kg, 8-10 reps, 70-80% effort
3. Dips machine: 3 sets, 12kg, 5-10 reps, 70-80% effort
4. Leg press: 3 sets, 100kg, 8-12 reps, 70-80% effort
5. Rope face pulls: 3 sets, 45kg, 10-15 reps, 70-80% effort
6. Shrugs: 3 sets, 20kg, 6-12 reps, 70-80% effort

**Day 2:**

1. Back squat: 3 sets, 45kg, 8-10 reps, 70-80% effort
2. Rope face pulls: 3 sets, 50kg, 10-15 reps, 70-80% effort
3. Chin up machine: 3 sets, 19kg, 5-10 reps, 70-80% effort
4. Bench press: 3 sets, 35kg, 6-8 reps, 70-80% effort
5. Wide grip row: 3 sets, 20kg, 10-12 reps, 70-80% effort
6. DB lateral raise: 3 sets, 5kg, 8-15 reps, 70-80% effort

**Day 3:**

1. Pendlay row: 3 sets, 42.5kg, 6-8 reps, 70-80% effort
2. Incline chest press: 3 sets, 35kg, 6-10 reps, 70-80% effort
3. Leg extension: 3 sets, 20kg, 8-15 reps, 70-80% effort
4. Lat pulldown under: 3 sets, 40kg, 6-12 reps, 70-80% effort
5. Rope face pulls: 3 sets, 40kg, 10-15 reps, 70-80% effort
6. Ruke: 3 sets, 20kg, 6-12 reps, 70-80% effort

All exercises start with `status = 'incomplete'` User starts at Week 1, Level 1, 0% progress

---

## 4. Technical Stack

**Frontend:**

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (dark mode only)
- Framer Motion (confetti)

**Backend:**

- Supabase (PostgreSQL + Auth + RLS)

**Auth:**

- Supabase OAuth (Google + Apple only, no email/password)

**State:**

- React Context (global user state)
- Local state (form inputs)
- Supabase real-time subscriptions

**Dark Mode:**

- Entire app dark theme
- No light mode toggle
- Background: dark gray/black (#0a0a0a, #1a1a1a)
- Text: white/light gray (#ffffff, #e5e5e5)
- Accents: status colors only (green checkmark, red X, amber/green recommendations)

---

## 5. Database Security (RLS Policies)

```sql
-- Users
auth.uid() = id

-- Workouts
auth.uid() = user_id

-- Exercises
auth.uid() = (SELECT user_id FROM workouts WHERE id = workout_id)

-- ExerciseSets
auth.uid() = (SELECT w.user_id FROM workouts w 
              JOIN exercises e ON e.workout_id = w.id 
              WHERE e.id = exercise_id)

-- WeightRecommendations
auth.uid() = user_id
```

---

## 6. Module Structure

```
/app
  /(auth)
    /login/page.tsx
  /(dashboard)
    /page.tsx              → Home
    /workout/[id]/page.tsx
    /exercise/[id]/page.tsx
    /finish/page.tsx
  /layout.tsx              → Dark mode globals

/components
  /exercise
    ExerciseCard.tsx
    ExerciseForm.tsx
    SetTracker.tsx
    WeightSelector.tsx
    EffortInput.tsx        → Number + slider combo
  /workout
    DayCard.tsx
    ExerciseList.tsx
    DraggableExercise.tsx  → Reorder logic
    WeekTransitionModal.tsx
  /ui
    Button.tsx
    Input.tsx
    Slider.tsx
    ProgressBar.tsx
    Confetti.tsx
    StatusIcon.tsx         → Checkmark/X/empty

/lib
  /supabase
    client.ts
    types.ts
  /utils
    weightRecommendation.ts
    levelProgress.ts
    exerciseAnalysis.ts
  /hooks
    useWorkout.ts
    useExercise.ts
    useUser.ts

/types
  database.types.ts        → Supabase auto-generated
```

---

## 7. Key Algorithms

### Next Exercise Navigation

```typescript
function getNextExercise(
  currentExerciseId: string,
  workoutExercises: Exercise[]
): Exercise | 'finish' {
  
  const incomplete = workoutExercises.filter(e => 
    e.status === 'incomplete'
  );
  
  if (incomplete.length === 0) return 'finish';
  
  const currentIndex = workoutExercises.findIndex(e => 
    e.id === currentExerciseId
  );
  
  for (let i = currentIndex + 1; i < workoutExercises.length; i++) {
    if (workoutExercises[i].status === 'incomplete') {
      return workoutExercises[i];
    }
  }
  
  return incomplete[0];
}
```

### Weight Recommendation

```typescript
function shouldIncreaseWeight(
  sets: ExerciseSet[], 
  exercise: Exercise
): 'none' | 'consider' | 'recommended' {
  
  let score = 0;
  const totalSets = sets.length;
  
  sets.forEach(set => {
    if (set.reps_completed >= exercise.rep_max && 
        set.effort_percentage <= exercise.target_effort_min) {
      score += 1;
    } else if (set.reps_completed >= exercise.rep_max) {
      score += 0.5;
    }
  });
  
  if (score >= totalSets) return 'recommended';
  if (score >= totalSets * 0.6) return 'consider';
  return 'none';
}
```

### Level Progress

```typescript
function updateLevelProgress(userId: string, totalExercises: number) {
  const increment = 100 / totalExercises;
  
  user.level_progress += increment;
  
  if (user.level_progress >= 100) {
    user.current_level += 1;
    user.level_progress = 0;
  }
}
```

### Week Analysis

```typescript
function analyzeWeekForRecommendations(
  userId: string,
  weekNumber: integer
): WeightRecommendation | null {
  
  const weekExercises = getExercisesByWeek(userId, weekNumber);
  const exerciseGroups = groupBy(weekExercises, 'name');
  const recommendations = [];
  
  for (const [name, exercises] of Object.entries(exerciseGroups)) {
    const allSets = exercises.flatMap(e => e.sets);
    const completedSets = allSets.filter(s => s.completed_at);
    
    if (completedSets.length === 0) continue;
    
    const allMaxedProper = completedSets.every(set =>
      set.reps_completed >= exercises[0].rep_max &&
      set.effort_percentage >= exercises[0].target_effort_min &&
      set.effort_percentage <= exercises[0].target_effort_max
    );
    
    const mostMaxedLow = completedSets.filter(set =>
      set.reps_completed >= exercises[0].rep_max &&
      set.effort_percentage <= exercises[0].target_effort_min
    ).length >= completedSets.length * 0.6;
    
    if (allMaxedProper) {
      recommendations.push({
        exercise_id: exercises[0].id,
        exercise_name: name,
        current_weight: exercises[0].weight_kg,
        recommendation: 'recommended'
      });
    } else if (mostMaxedLow) {
      recommendations.push({
        exercise_id: exercises[0].id,
        exercise_name: name,
        current_weight: exercises[0].weight_kg,
        recommendation: 'consider'
      });
    }
  }
  
  if (recommendations.length === 0) return null;
  
  return createWeightRecommendation(userId, weekNumber, recommendations);
}
```

---

## 8. Implementation Priority

1. Auth (Google + Apple OAuth)
2. Dark mode global styles
3. User seed with default exercises
4. Core CRUD (exercises, sets, workouts)
5. Exercise tracking (reps/effort input, navigation)
6. Status indicators (complete/skipped/incomplete)
7. Skip button
8. Drag-to-reorder
9. Effort number+slider input
10. Week transition + weight recommendations
11. Confetti variations
12. Level progression bar

---

## 9. MVP Exclusions

Deferred post-MVP:

- Import Google Sheets template
- Export workout data
- Dashboard analytics (total workouts, weekly average, level graph, volume trends, streaks)