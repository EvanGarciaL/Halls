import type { TimeOfDay, Day} from "./time-models";

export interface Lecture {
  readonly courseId: string;
  readonly courseCode: string;       // e.g. "COMPSCI 161"
  readonly courseTitle: string;      // e.g. "DES & ANALYS ALGOR"
  readonly department: string;       // e.g. "COMPSCI"
  readonly school: string;
  readonly building: string;         // e.g. "DBH 1100"

  readonly days: ReadonlySet<Day>;
  readonly startTime: TimeOfDay;
  readonly endTime: TimeOfDay
}

export type QuarterName = "Fall" | "Winter" | "Spring" | "Summer1" | "Summer10wk" | "Summer2"
export type SummerQuarterName = "Summer1" | "Summer10wk" | "Summer2"

export interface Quarter {
  readonly year: number,
  readonly quarter: QuarterName,
  readonly instructionStart: Date,
  readonly instructionEnd: Date,
  readonly finalsStart: Date,
  readonly finalsEnd: Date,
}
