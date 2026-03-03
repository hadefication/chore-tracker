export function getTodayDateKey(): string {
  return toDateKey(new Date())
}

export function getCurrentMonthKey(): string {
  return getMonthKeyFromDate(getTodayDateKey())
}

export function toDateKey(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`)
}

export function getMonthKeyFromDate(dateKey: string): string {
  return dateKey.slice(0, 7)
}

export function formatMonthLabel(monthKey: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(parseDateKey(`${monthKey}-01`))
}

export function formatLongDate(dateKey: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(parseDateKey(dateKey))
}

export function formatShortDate(dateKey: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(parseDateKey(dateKey))
}

export function addDays(dateKey: string, amount: number): string {
  const next = parseDateKey(dateKey)
  next.setDate(next.getDate() + amount)
  return toDateKey(next)
}

export function isNextCalendarDay(previousDateKey: string, currentDateKey: string): boolean {
  return addDays(previousDateKey, 1) === currentDateKey
}

export function compareDateKeys(left: string, right: string): number {
  return left.localeCompare(right)
}

export function getDaysRemainingInMonth(monthKey: string): number {
  const today = getTodayDateKey()
  if (getMonthKeyFromDate(today) !== monthKey) {
    return 0
  }

  const current = parseDateKey(today)
  const end = new Date(current.getFullYear(), current.getMonth() + 1, 0)
  return end.getDate() - current.getDate()
}

export function getMonthDayKeys(monthKey: string): string[] {
  const firstDay = parseDateKey(`${monthKey}-01`)
  const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate()

  return Array.from({ length: daysInMonth }, (_, index) => {
    const next = new Date(firstDay)
    next.setDate(index + 1)
    return toDateKey(next)
  })
}

export function getMonthGrid(monthKey: string): Array<string | null> {
  const days = getMonthDayKeys(monthKey)
  const firstDateKey = days[0]
  if (!firstDateKey) {
    return []
  }

  const firstDay = parseDateKey(firstDateKey)
  const leading = firstDay.getDay()
  const cells: Array<string | null> = Array.from({ length: leading }, () => null)

  cells.push(...days)

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

export function shiftMonth(monthKey: string, amount: number): string {
  const [yearText, monthText] = monthKey.split('-')
  const next = new Date(Number(yearText), Number(monthText) - 1 + amount, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

export function isPastOrToday(dateKey: string): boolean {
  return dateKey <= getTodayDateKey()
}
