import type { Quarter, SummerQuarterName } from "./models/calendar-models";

export function getCurrentQuarter(currentDate : Date, quarterArray : Quarter[]) : Quarter | false {
  for (const q of quarterArray) {
    if (currentDate < q.instructionStart) return false
    if (currentDate < q.instructionEnd) return q
  }
  throw new Error(`Unable to get Quarter for : ${currentDate.toDateString()}`)
}

export function getAvailableSummerQuarters(currentDate: Date, quarterArray: Quarter[]) {
  let summerQtrs = {
    Summer1 : false,
    Summer10wk : false,
    Summer2 : false,
  }

  for (const q of quarterArray) {
    if (q.instructionStart <= currentDate && currentDate <= q.instructionEnd) {
      summerQtrs[q.quarter as SummerQuarterName]
    }
  }
}
