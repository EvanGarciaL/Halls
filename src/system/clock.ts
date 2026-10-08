import type { TimeOfDay } from "../domain/models/time-models"


export function getCurrentTime() : TimeOfDay {
  const ct = new Date()
  return {
    hour : ct.getHours(),
    minute : ct.getMinutes()
  }
}

export function getCurrentDateStr() : string {
  const today = new Date();
  const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const [mm,dd,yyyy] = dtf.formatToParts(today);

  const formattedDate = `${yyyy}-${mm}-${dd}`;
  return (formattedDate);
}

