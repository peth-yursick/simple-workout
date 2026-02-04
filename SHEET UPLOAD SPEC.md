## Revised Spreadsheet Import Specification - Multi-Week Program Support

---

## 1. Understanding the PECO Structure

From your spreadsheet:

- **Multiple sheets** = Different training phases/cycles
- **Each sheet** = 8-week program ("sprint")
- **Columns grouped by week**: Week 1 (cols), Week 2 (cols), etc.
- **Rows grouped by day**: Day 1 exercises, Day 2 exercises, Day 3 exercises
- **Data per exercise**: Name, Sets, Weight, Rep range, RPE

---

## 2. New Data Model - Program Cycles

### Program

```typescript
{
  id: uuid
  user_id: uuid
  name: string // Sheet name or "Program 1", "Program 2"
  total_weeks: integer // Usually 8
  current_week: integer // User's progress through this program
  order: integer // Sequence: Program 1 → Program 2 → Program 3
  status: 'active' | 'completed' | 'upcoming'
  created_at: timestamp
}
```

### Week Template

```typescript
{
  id: uuid
  program_id: uuid
  week_number: integer // 1-8
  created_at: timestamp
}
```

### Exercise (updated)

```typescript
{
  id: uuid
  week_template_id: uuid // FK to WeekTemplate
  day_number: integer // 1-3
  name: string
  order: integer
  sets: integer
  weight_kg: float
  rep_min: integer
  rep_max: integer
  target_effort_min: integer
  target_effort_max: integer
  status: 'incomplete' | 'complete' | 'skipped'
  created_at: timestamp
}
```

### User Progress

```typescript
{
  user_id: uuid
  current_program_id: uuid
  current_week_in_program: integer // 1-8
  week_start_date: date
}
```

---

## 3. Spreadsheet Structure Analysis

### Expected Layout (PECO format)

```
Sheet 1: "Phase 1"
─────────────────────────────────────────────────────────────
         Week 1              Week 2              Week 8
         Ex|Set|kg|Rep|RPE   Ex|Set|kg|Rep|RPE  ...
Day 1    ...                 ...                ...
Day 2    ...                 ...                ...  
Day 3    ...                 ...                ...

Sheet 2: "Phase 2"
[Same structure, 8 more weeks]
```

### Parsing Strategy

```typescript
1. Read all sheets in workbook
2. For each sheet:
   - Detect week columns (look for "Week N" headers)
   - Detect day rows (look for "Day N" labels)
   - Extract exercise blocks per day per week
3. Create Program per sheet
4. Create WeekTemplate per week (8 per program)
5. Create Exercises per day per week
```

---

## 4. Import Logic

### Step 1: Detect Structure

```typescript
function analyzeSheet(worksheet) {
  // Find week column groups
  const weekColumns = findWeekHeaders(worksheet); 
  // Returns: [{week: 1, startCol: 'B', endCol: 'F'}, ...]
  
  // Find day row groups
  const dayRows = findDayHeaders(worksheet);
  // Returns: [{day: 1, startRow: 5, endRow: 10}, ...]
  
  return { weekColumns, dayRows };
}
```

### Step 2: Extract Exercise Data

```typescript
function extractExercises(worksheet, weekCol, dayRow) {
  const exercises = [];
  
  // Iterate through rows in day block
  for (let row = dayRow.startRow; row <= dayRow.endRow; row++) {
    const exerciseName = getCellValue(worksheet, weekCol.nameCol, row);
    if (!exerciseName) continue;
    
    exercises.push({
      name: exerciseName,
      sets: getCellValue(worksheet, weekCol.setsCol, row),
      weight_kg: getCellValue(worksheet, weekCol.weightCol, row),
      rep_min: parseRepRange(getCellValue(worksheet, weekCol.repsCol, row))[0],
      rep_max: parseRepRange(getCellValue(worksheet, weekCol.repsCol, row))[1],
      target_effort_min: parseRPE(getCellValue(worksheet, weekCol.rpeCol, row))[0],
      target_effort_max: parseRPE(getCellValue(worksheet, weekCol.rpeCol, row))[1],
      order: exercises.length
    });
  }
  
  return exercises;
}
```

### Step 3: Build Program Structure

```typescript
async function importProgram(file: File, userId: string) {
  const workbook = XLSX.read(await file.arrayBuffer());
  const programs = [];
  
  // Process each sheet
  for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
    const sheetName = workbook.SheetNames[sheetIndex];
    const worksheet = workbook.Sheets[sheetName];
    
    const { weekColumns, dayRows } = analyzeSheet(worksheet);
    
    // Create program
    const program = await createProgram({
      user_id: userId,
      name: sheetName,
      total_weeks: weekColumns.length,
      order: sheetIndex,
      status: sheetIndex === 0 ? 'active' : 'upcoming'
    });
    
    // Create week templates
    for (const weekCol of weekColumns) {
      const weekTemplate = await createWeekTemplate({
        program_id: program.id,
        week_number: weekCol.week
      });
      
      // Extract exercises for each day
      for (const dayRow of dayRows) {
        const exercises = extractExercises(worksheet, weekCol, dayRow);
        
        await batchCreateExercises(
          weekTemplate.id,
          dayRow.day,
          exercises
        );
      }
    }
    
    programs.push(program);
  }
  
  // Set user to first program, week 1
  await updateUserProgress({
    user_id: userId,
    current_program_id: programs[0].id,
    current_week_in_program: 1,
    week_start_date: new Date()
  });
  
  return programs;
}
```

---

## 5. Column Detection Logic

### Find Week Headers

```typescript
function findWeekHeaders(worksheet) {
  const weekColumns = [];
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Scan first few rows for "Week N" pattern
  for (let row = 0; row <= 5; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = worksheet[XLSX.utils.encode_cell({r: row, c: col})];
      if (!cell) continue;
      
      const match = cell.v.toString().match(/Week\s*(\d+)/i);
      if (match) {
        weekColumns.push({
          week: parseInt(match[1]),
          headerRow: row,
          startCol: col,
          // Assume 5 columns per week: Exercise, Sets, Weight, Reps, RPE
          endCol: col + 4,
          nameCol: col,
          setsCol: col + 1,
          weightCol: col + 2,
          repsCol: col + 3,
          rpeCol: col + 4
        });
      }
    }
  }
  
  return weekColumns.sort((a, b) => a.week - b.week);
}
```

### Find Day Headers

```typescript
function findDayHeaders(worksheet) {
  const dayRows = [];
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Scan first column for "Day N" pattern
  for (let row = 0; row <= range.e.r; row++) {
    const cell = worksheet[XLSX.utils.encode_cell({r: row, c: 0})];
    if (!cell) continue;
    
    const match = cell.v.toString().match(/Day\s*(\d+)/i);
    if (match) {
      const dayNum = parseInt(match[1]);
      const startRow = row + 1; // Exercises start next row
      
      // Find end of day block (next "Day" label or empty rows)
      let endRow = startRow;
      while (endRow <= range.e.r) {
        const nextCell = worksheet[XLSX.utils.encode_cell({r: endRow, c: 0})];
        if (nextCell && nextCell.v.toString().match(/Day\s*\d+/i)) {
          break;
        }
        endRow++;
      }
      
      dayRows.push({
        day: dayNum,
        headerRow: row,
        startRow: startRow,
        endRow: endRow - 1
      });
    }
  }
  
  return dayRows.sort((a, b) => a.day - b.day);
}
```

---

## 6. User Flow Changes

### Home Screen

```
┌─────────────────────────────────────┐
│ Program: Phase 1                    │
│ Week 3 of 8                         │
│ ████████████░░░░░░░░ 37%            │
└─────────────────────────────────────┘

┌──────┐ ┌──────┐ ┌──────┐
│Day 1 │ │Day 2 │ │Day 3 │
│  ✓   │ │  ✓   │ │      │
└──────┘ └──────┘ └──────┘
```

### Week Completion Flow (Updated)

```typescript
// When user completes all 3 days of current week:
if (currentWeek < program.total_weeks) {
  // Advance to next week in same program
  user.current_week_in_program++;
} else {
  // Program complete, check for next program
  const nextProgram = await getNextProgram(user.current_program_id);
  
  if (nextProgram) {
    // Move to next program
    user.current_program_id = nextProgram.id;
    user.current_week_in_program = 1;
    nextProgram.status = 'active';
    currentProgram.status = 'completed';
    
    showModal(`
      🎉 Phase 1 Complete!
      Starting Phase 2: ${nextProgram.name}
    `);
  } else {
    // All programs complete
    showModal(`
      🏆 All Programs Complete!
      You've finished the entire training cycle.
    `);
  }
}
```

---

## 7. Exercise Loading

### Get Current Week Exercises

```typescript
function getCurrentWeekExercises(userId) {
  const user = await getUser(userId);
  const program = await getProgram(user.current_program_id);
  const weekTemplate = await getWeekTemplate(
    program.id, 
    user.current_week_in_program
  );
  
  // Get exercises for this week, grouped by day
  return await getExercisesByWeekTemplate(weekTemplate.id);
}
```

---

## 8. Progressive Overload Across Weeks

### Weight Recommendations

- Compare current week to previous week in same program
- If Week 3 → compare to Week 2
- If Week 1 of new program → compare to Week 8 of previous program

```typescript
function getProgressionContext(userId) {
  const current = getCurrentWeekExercises(userId);
  
  if (user.current_week_in_program > 1) {
    // Compare to previous week in same program
    const previous = getWeekExercises(
      user.current_program_id,
      user.current_week_in_program - 1
    );
  } else {
    // First week of program, compare to last week of previous program
    const prevProgram = getPreviousProgram(user.current_program_id);
    if (prevProgram) {
      const previous = getWeekExercises(
        prevProgram.id,
        prevProgram.total_weeks // Last week
      );
    }
  }
  
  return { current, previous };
}
```

---

## 9. Level System Update

### Level Progress

- Level up based on weight increases across entire program cycle
- Not just per week, but cumulative over 8+ weeks

```typescript
// When user increases weight on exercise:
const totalExercisesInProgram = 
  program.total_weeks × days_per_week × exercises_per_day;

const increment = 100 / totalExercisesInProgram;
user.level_progress += increment;
```

---

## 10. Import UI Updates

### Onboarding

```
┌─────────────────────────────────────┐
│  Upload Training Program            │
│                                     │
│  Your spreadsheet will be analyzed  │
│  to create a multi-week program.    │
│                                     │
│  📄 Drop .xlsx file or click       │
│                                     │
│  ✓ Supports multiple training phases│
│  ✓ Auto-detects weeks and days     │
│  ✓ Preserves your progression plan │
└─────────────────────────────────────┘
```

### Import Success

```
✅ Import Complete

Programs imported:
  • Phase 1: 8 weeks, 144 exercises
  • Phase 2: 8 weeks, 144 exercises
  • Phase 3: 8 weeks, 144 exercises

Starting: Phase 1, Week 1

[Begin Training]
```

---

## 11. Navigation Changes

### Settings → Programs

```
My Programs

Active:
┌─────────────────────────────────────┐
│ Phase 1                             │
│ Week 3 of 8 (37% complete)         │
│ ████████████░░░░░░░░                │
└─────────────────────────────────────┘

Upcoming:
┌─────────────────────────────────────┐
│ Phase 2                             │
│ 8 weeks • Starts after Phase 1     │
└─────────────────────────────────────┘

Completed:
[None yet]
```

---

## 12. Implementation Priority

1. New data models (Program, WeekTemplate, updated Exercise)
2. SheetJS integration + structure detection
3. Week/day header parsing
4. Exercise extraction per week/day
5. Batch creation pipeline
6. User progress tracking (program + week)
7. Week completion → next week/program logic
8. Updated home screen (show program/week)
9. Import UI (warnings, success screen)
10. Settings → Programs view

---

## 13. Edge Cases

**Inconsistent structure:**

- Some weeks missing exercises → skip those weeks, log warning

**Different exercise counts per week:**

- Allow (normal for periodization)

**Missing sheets:**

- Single sheet = single program (8 weeks)

**More than 3 days:**

- Import first 3 days only, warn user

**Fewer than 8 weeks:**

- Accept any number of weeks (2-52)

**Non-standard column order:**

- Attempt to detect by headers ("Sets", "Weight", "Reps", "RPE")
- Fallback to position if no headers