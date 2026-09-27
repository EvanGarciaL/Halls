export type Day = 'M' | 'Tu' | 'W' | 'Th' | 'F'

export type Quarters = "Fall" | "Winter" | "Spring" | "Summer1" | "Summer10wk" | "Summer2"

export interface TimeOfDay {
  readonly hour : number,
  readonly minute : number
}

export function parseTime(hhmm : string) : TimeOfDay {
  const [h, m] = hhmm.split(':').map(Number);
  if (typeof(h) !== "number") throw Error(`Hour is not a number ${h}`)
  if (typeof(m) !== "number") throw Error(`Minute is not a number ${m}`)

  return {
    hour : h,
    minute : m
  };

}

export function toAMPMString(time : TimeOfDay) : string {
  const period = time.hour >= 12 ? 'PM' : 'AM';
  const hour12 = time.hour % 12 || 12;
  const minuteStr = time.minute.toString().padStart(2, '0');
  return `${hour12}:${minuteStr} ${period}`
}


