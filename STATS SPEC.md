## Dashboard Statistics Specification

---

## 1. Core Metrics

### Time Filter Toggle

- All-time / Last 2 months
- Single toggle at top of dashboard
- Affects all stats below

### Primary Stats (Cards)

1. **Total Workouts Completed** - raw count
2. **Current Level** - display with progress bar to next level
3. **Average Workouts/Week** - calculated over selected timeframe
4. **Consistency %** - (completed days / scheduled days) × 100
    - Based on 3 days/week expectation (user sets this)
    - Example: 24 completed out of 26 expected = 92%

---

## 2. Volume Progression

### Total Volume Graph

- Line chart: X-axis = time (weeks), Y-axis = total volume (sets × reps × weight)
- Aggregate all exercises per workout
- Shows trend: increasing, plateau, declining

---

## 3. Exercise Performance Analysis

### Top/Bottom Performers

**Two lists side-by-side:**

**Advancing** (left, green):

- Exercises with consistent weight increases
- Metric: number of weight increases in timeframe
- Sorted descending

**Stagnating** (right, amber/red):

- Exercises with no weight increase in 3+ weeks
- Sorted by weeks since last increase

**Display format:**

```
Exercise name
Last increase: X weeks ago
Weight progression: 40kg → 45kg → 50kg (arrow visualization)
```

---

## 4. Muscle Group Balance

### Visualization

- Bar chart or heatmap
- Muscle groups: Chest, Back, Legs, Shoulders, Arms, Core
- Color-coded by volume relative to average:
    - Green: Above average (overworked)
    - Yellow: Average
    - Red: Below average (underworked)

### Progression by Muscle Group

- Which muscle groups advancing fastest (weight increases)
- Which stagnating
- Derived from exercise categorization

**Exercise → Muscle Group Mapping:**

```
Stiff leg deadlift → Legs, Back
Wide grip row → Back
Dips → Chest, Arms
Leg press → Legs
Face pulls → Shoulders, Back
Shrugs → Shoulders
Back squat → Legs
Chin up → Back, Arms
Bench press → Chest, Arms
DB lateral raise → Shoulders
Pendlay row → Back
Incline press → Chest
Leg extension → Legs
Lat pulldown → Back, Arms
```

---

## 5. Streak Tracking

### Weekly Streak

- Consecutive weeks hitting 3/3 days
- Display: "X week streak"
- Breaks if user misses week

### Consistency Percentage

- Formula: (days completed / days scheduled) × 100
- Timeframe: selected filter (all-time or 2 months)
- Display: "92% consistent"

---

## 6. Data Structure Requirements

### New Database Tables

**UserSettings**

```typescript
{
  user_id: uuid
  workouts_per_week: integer // default 3
  created_at: timestamp
}
```

**ExerciseMuscleMap** (static reference)

```typescript
{
  exercise_name: string
  primary_muscle: string
  secondary_muscle: string | null
}
```

**WorkoutVolume** (calculated, cached)

```typescript
{
  workout_id: uuid
  total_volume: float // sum(sets × reps × weight)
  calculated_at: timestamp
}
```

---

## 7. Calculations

### Volume

```typescript
workout_volume = sum(
  exercise.sets.map(set => 
    set.reps_completed × exercise.weight_kg
  )
)
```

### Consistency %

```typescript
weeks_in_period = (end_date - start_date) / 7
expected_workouts = weeks_in_period × user.workouts_per_week
actual_workouts = count(completed workouts in period)
consistency = (actual_workouts / expected_workouts) × 100
```

### Exercise Advancement Score

```typescript
weight_increases = count(weeks where weight > previous_week_weight)
weeks_since_increase = current_week - last_increase_week
```

### Muscle Group Volume

```typescript
for each muscle_group:
  volume = sum(
    exercises where muscle_group in [primary, secondary]
    × (sets × reps × weight)
  )
```

---

## 8. Dashboard Layout

```
┌─────────────────────────────────────┐
│  [All-time] / [Last 2 months]       │
└─────────────────────────────────────┘

┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ 156  │ │Level │ │ 3.2  │ │ 94%  │
│Work- │ │  8   │ │Avg/  │ │Cons- │
│outs  │ │████░░│ │Week  │ │ist.  │
└──────┘ └──────┘ └──────┘ └──────┘

┌─────────────────────────────────────┐
│ Total Volume Over Time              │
│                                     │
│     ┌─────────────────────         │
│     │        ╱                      │
│     │      ╱                        │
│     │    ╱                          │
│     └───────────────────────        │
│     Week 1  →  Week 12              │
└─────────────────────────────────────┘

┌──────────────┐ ┌──────────────────┐
│ Advancing ✓  │ │ Stagnating ⚠     │
│              │ │                  │
│ Bench press  │ │ Leg extension    │
│ +5kg (2w ago)│ │ No change (4w)   │
│              │ │                  │
│ Back squat   │ │ Shrugs           │
│ +2.5kg (1w)  │ │ No change (6w)   │
└──────────────┘ └──────────────────┘

┌─────────────────────────────────────┐
│ Muscle Group Balance                │
│                                     │
│ Chest    ████████░░ 80%             │
│ Back     ██████████ 100%            │
│ Legs     ████░░░░░░ 40%  ← Alert   │
│ Shoulders███████░░░ 70%             │
│ Arms     █████████░ 90%             │
└─────────────────────────────────────┘
```

---

## 9. UI Components

```
/components
  /dashboard
    StatCard.tsx          → Workout count, level, avg, consistency
    VolumeChart.tsx       → Line graph
    ExercisePerformance.tsx → Advancing/stagnating lists
    MuscleBalance.tsx     → Bar chart with color coding
    TimeFilter.tsx        → All-time / 2 month toggle
```

---

## 10. Implementation Priority

1. Time filter state management
2. Volume calculation logic
3. Consistency % calculation
4. Exercise advancement detection
5. Muscle group mapping + volume distribution
6. Dashboard layout + stat cards
7. Charts (volume line, muscle balance bars)
8. Performance lists (advancing/stagnating)



To fix:
1. It says average per week i think based on total exercises instead of total days non-skipped, showing the same number for "workouts" (15 in case of Pethereum)
2. Showing consistency as only 9% for some reason, despite never skipping any days or only skipping 1 day on first week
3. When i toggle to "last 2 months", the consistency shows at 56% & average week as 1.7. Maybe its calculating these based on the fact its week 6 so the full 2 months havent passed yet. It shouldnt be so, even if its only Week 1, if i completed all days, it should show consistency as 100% & average week as the number of days the user set
4. On total volume graph, the blue node circles are shown as stretched horizontally
5. In advancing column, green numbers go outside the box on the right. Probably not necessary to show full progression of weights for each exercise. Maybe only leave starting point & current point?
6. Also its showing only 5 exercises, not sure if thats because only 5 are advancing (i think i upgraded more) or because the box itself is setting limit on how many are displayed
7. For stagnating its not showing anything, dont remember what the set logic was, but something should appear after an exercise hasnt been increased in weight for more than say 3 weeks, unless the user is level 30 or something at which point progression is even slower. maybe ask me about it based on current logic
8. on muscle group balance, "needs work" is overlapping with total & percentage, maybe remove the "needs work" indicator as a whole as red color implies it
9. Can you add support chat bubble to the bottom right corner, it should open WhatsApp chat with the user that has this number +385977195155
