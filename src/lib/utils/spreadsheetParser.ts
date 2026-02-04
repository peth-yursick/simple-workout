import * as XLSX from 'xlsx'

// Base exercise structure used in parsing
export interface ParsedExercise {
  name: string
  sets: number
  weight_kg: number
  rep_min: number
  rep_max: number
  target_effort_min: number
  target_effort_max: number
  order: number
}

// Day containing exercises
export interface ParsedDay {
  dayNumber: number
  exercises: ParsedExercise[]
}

// Week containing days
export interface ParsedWeek {
  weekNumber: number
  days: ParsedDay[]
}

// Program (one sheet) containing weeks
export interface ParsedProgram {
  name: string
  weeks: ParsedWeek[]
}

// Full parse result
export interface ParseResult {
  programs: ParsedProgram[]
  totalExercises: number
  totalWeeks: number
  warnings: string[]
}

// Legacy format result (for backwards compatibility)
export interface LegacyParseResult {
  days: ParsedDay[]
  totalExercises: number
  warnings: string[]
}

// Week column detection result
interface WeekColumn {
  weekNumber: number
  startCol: number
  // Column offsets from startCol: Exercise(0), Sets(1), Weight(2), Reps(3), RPE(4)
}

// Day row detection result
interface DayRow {
  dayNumber: number
  headerRow: number
  startRow: number
  endRow: number
}

function parseRepRange(cell: string | number | undefined): [number, number] {
  if (cell === undefined || cell === null || cell === '') {
    return [6, 8]
  }

  const str = String(cell).trim()
  const match = str.match(/(\d+)\s*-\s*(\d+)/)
  if (match) {
    return [parseInt(match[1]), parseInt(match[2])]
  }

  const single = parseInt(str)
  if (!isNaN(single)) {
    return [single, single]
  }

  return [6, 8]
}

function parseEffortRange(cell: string | number | undefined): [number, number] {
  if (cell === undefined || cell === null || cell === '') {
    return [70, 80]
  }

  const str = String(cell).trim()
  const match = str.match(/(\d+)\s*-\s*(\d+)/)
  if (match) {
    let min = parseInt(match[1])
    let max = parseInt(match[2])

    // If values are 1-10, multiply by 10
    if (min <= 10) min *= 10
    if (max <= 10) max *= 10

    return [min, max]
  }

  const single = parseInt(str)
  if (!isNaN(single)) {
    const val = single <= 10 ? single * 10 : single
    return [val, Math.min(val + 10, 100)]
  }

  return [70, 80]
}

// Detect "Week N" headers in the first few rows
function detectWeekColumns(rows: unknown[][]): WeekColumn[] {
  const weekColumns: WeekColumn[] = []
  const foundWeeks = new Set<number>()

  // Scan first 5 rows for "Week N" patterns
  for (let rowIdx = 0; rowIdx < Math.min(5, rows.length); rowIdx++) {
    const row = rows[rowIdx]
    if (!row) continue

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cell = row[colIdx]
      if (cell === undefined || cell === null) continue

      const cellStr = String(cell).trim()
      const match = cellStr.match(/Week\s*(\d+)/i)
      if (match) {
        const weekNum = parseInt(match[1])
        if (!foundWeeks.has(weekNum)) {
          foundWeeks.add(weekNum)
          weekColumns.push({
            weekNumber: weekNum,
            startCol: colIdx
          })
        }
      }
    }
  }

  return weekColumns.sort((a, b) => a.weekNumber - b.weekNumber)
}

// Detect "Day N" headers in the first column
function detectDayRows(rows: unknown[][]): DayRow[] {
  const dayRows: DayRow[] = []

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx]
    if (!row) continue

    // Check first column (A) for day labels
    const firstCell = row[0]
    if (firstCell === undefined || firstCell === null) continue

    const cellStr = String(firstCell).trim()
    const match = cellStr.match(/Day\s*(\d+)/i)
    if (match) {
      const dayNum = parseInt(match[1])

      // Close previous day if exists
      if (dayRows.length > 0) {
        dayRows[dayRows.length - 1].endRow = rowIdx - 1
      }

      dayRows.push({
        dayNumber: dayNum,
        headerRow: rowIdx,
        startRow: rowIdx + 1,
        endRow: rows.length - 1 // Will be updated when next day is found
      })
    }
  }

  return dayRows.sort((a, b) => a.dayNumber - b.dayNumber)
}

// Parse exercises for a specific week/day intersection
function parseExercisesForWeekDay(
  rows: unknown[][],
  weekCol: WeekColumn,
  dayRow: DayRow
): ParsedExercise[] {
  const exercises: ParsedExercise[] = []
  let order = 0

  // PECO column offsets from week start column
  const EXERCISE_OFFSET = 0
  const SETS_OFFSET = 1
  const WEIGHT_OFFSET = 2
  const REPS_OFFSET = 3
  const RPE_OFFSET = 4

  for (let rowIdx = dayRow.startRow; rowIdx <= dayRow.endRow; rowIdx++) {
    const row = rows[rowIdx]
    if (!row) continue

    const nameCell = row[weekCol.startCol + EXERCISE_OFFSET]
    if (nameCell === undefined || nameCell === null) continue

    const name = String(nameCell).trim()
    if (!name) continue

    // Skip if this looks like a header row (e.g., "Exercise", "Øvelse")
    if (name.toLowerCase() === 'exercise' || name.toLowerCase() === 'øvelse') continue

    const setsCell = row[weekCol.startCol + SETS_OFFSET]
    const weightCell = row[weekCol.startCol + WEIGHT_OFFSET]
    const repsCell = row[weekCol.startCol + REPS_OFFSET]
    const rpeCell = row[weekCol.startCol + RPE_OFFSET]

    const [repMin, repMax] = parseRepRange(repsCell as string | number | undefined)
    const [effortMin, effortMax] = parseEffortRange(rpeCell as string | number | undefined)

    exercises.push({
      name,
      sets: parseInt(String(setsCell)) || 3,
      weight_kg: parseFloat(String(weightCell)) || 20,
      rep_min: repMin,
      rep_max: repMax,
      target_effort_min: effortMin,
      target_effort_max: effortMax,
      order: order++
    })
  }

  return exercises
}

// Parse a single sheet in PECO format
function parsePECOSheet(sheetName: string, rows: unknown[][], warnings: string[]): ParsedProgram | null {
  const weekColumns = detectWeekColumns(rows)
  const dayRows = detectDayRows(rows)

  if (weekColumns.length === 0) {
    warnings.push(`Sheet "${sheetName}": No "Week N" headers found`)
    return null
  }

  if (dayRows.length === 0) {
    warnings.push(`Sheet "${sheetName}": No "Day N" headers found`)
    return null
  }

  const weeks: ParsedWeek[] = []

  for (const weekCol of weekColumns) {
    const days: ParsedDay[] = []

    for (const dayRow of dayRows) {
      const exercises = parseExercisesForWeekDay(rows, weekCol, dayRow)

      if (exercises.length > 0) {
        days.push({
          dayNumber: dayRow.dayNumber,
          exercises
        })
      }
    }

    if (days.length > 0) {
      weeks.push({
        weekNumber: weekCol.weekNumber,
        days
      })
    }
  }

  if (weeks.length === 0) {
    warnings.push(`Sheet "${sheetName}": No exercises found`)
    return null
  }

  return {
    name: sheetName,
    weeks
  }
}

// Legacy format: empty rows separate days, columns B-F have data
function isRowEmpty(row: unknown[]): boolean {
  if (!row || row.length === 0) return true
  return row.every(cell => cell === undefined || cell === null || String(cell).trim() === '')
}

function parseLegacyFormat(rows: unknown[][]): ParsedDay[] {
  const days: ParsedDay[] = []
  let currentDay: ParsedDay = { dayNumber: 1, exercises: [] }
  let exerciseOrder = 0

  for (const row of rows) {
    if (isRowEmpty(row)) {
      // Empty row = day boundary
      if (currentDay.exercises.length > 0) {
        days.push(currentDay)
        currentDay = { dayNumber: days.length + 1, exercises: [] }
        exerciseOrder = 0
      }
      continue
    }

    // Column B (index 1) is exercise name
    const name = row[1] !== undefined && row[1] !== null ? String(row[1]).trim() : ''
    if (!name) continue

    const exercise: ParsedExercise = {
      name,
      sets: parseInt(String(row[2])) || 3,
      weight_kg: parseFloat(String(row[3])) || 20,
      rep_min: parseRepRange(row[4] as string | number | undefined)[0],
      rep_max: parseRepRange(row[4] as string | number | undefined)[1],
      target_effort_min: parseEffortRange(row[5] as string | number | undefined)[0],
      target_effort_max: parseEffortRange(row[5] as string | number | undefined)[1],
      order: exerciseOrder++,
    }

    currentDay.exercises.push(exercise)
  }

  if (currentDay.exercises.length > 0) {
    days.push(currentDay)
  }

  return days
}

// Detect if sheet is PECO format (has Week headers) or legacy format
function isPECOFormat(rows: unknown[][]): boolean {
  const weekColumns = detectWeekColumns(rows)
  const dayRows = detectDayRows(rows)
  return weekColumns.length > 0 && dayRows.length > 0
}

// Main parse function for PECO multi-week format
export async function parseSpreadsheet(file: File): Promise<ParseResult> {
  const warnings: string[] = []

  // Read file
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer)

  if (workbook.SheetNames.length === 0) {
    throw new Error('Could not read spreadsheet. Please use .xlsx format')
  }

  const programs: ParsedProgram[] = []

  // Process each sheet
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 })

    if (isPECOFormat(rows)) {
      // Parse as PECO multi-week format
      const program = parsePECOSheet(sheetName, rows, warnings)
      if (program) {
        programs.push(program)
      }
    } else {
      // Try legacy format (empty rows separate days)
      const days = parseLegacyFormat(rows)
      if (days.length > 0) {
        // Limit legacy format to 3 days
        if (days.length > 3) {
          warnings.push(`Sheet "${sheetName}": Found ${days.length} days, limiting to 3`)
        }
        const limitedDays = days.slice(0, 3)

        // Convert to program with single week
        programs.push({
          name: sheetName,
          weeks: [{
            weekNumber: 1,
            days: limitedDays
          }]
        })
      }
    }
  }

  if (programs.length === 0) {
    throw new Error('No exercises found in spreadsheet')
  }

  // Calculate totals
  let totalExercises = 0
  let totalWeeks = 0
  for (const program of programs) {
    totalWeeks += program.weeks.length
    for (const week of program.weeks) {
      for (const day of week.days) {
        totalExercises += day.exercises.length
      }
    }
  }

  return {
    programs,
    totalExercises,
    totalWeeks,
    warnings
  }
}

// Legacy parse function for backwards compatibility
export async function parseSpreadsheetLegacy(file: File): Promise<LegacyParseResult> {
  const result = await parseSpreadsheet(file)

  // Flatten to legacy format: just first program, first week
  if (result.programs.length === 0) {
    return { days: [], totalExercises: 0, warnings: result.warnings }
  }

  const firstProgram = result.programs[0]
  const firstWeek = firstProgram.weeks[0]
  const days = firstWeek?.days || []

  return {
    days,
    totalExercises: days.reduce((sum, d) => sum + d.exercises.length, 0),
    warnings: result.warnings
  }
}
