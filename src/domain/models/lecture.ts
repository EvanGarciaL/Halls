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
