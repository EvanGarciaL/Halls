import type { ClassMeeting } from './models'
import type { WebSocResponse } from '../types/generated/anteater-api-types'
import { TimeOfDay } from './time'
import { parseDays } from './day-parser'

// Pull out the nested meeting type from the generated API types so we can
// reference it without a 5-level deep type access chain.
type ApiSchool = WebSocResponse['data']['schools'][number]
type ApiDepartment = ApiSchool['departments'][number]
type ApiCourse = ApiDepartment['courses'][number]
type ApiSection = ApiCourse['sections'][number]
type ApiMeeting = ApiSection['meetings'][number]

/**
 * Transform the raw WebSOC API response into a flat array of ClassMeeting
 * domain objects.
 *
 * This function is the bridge between the external API shape (deeply nested
 * schools → departments → courses → sections → meetings) and our app's
 * flat domain model.
 *
 * Filters out:
 * - Meetings where the time is TBA
 * - Online-only meetings ("ON LINE")
 * - Meetings with no assigned building ("TBA ")
 *
 * Renamed from `locations()` — that name didn't describe what the function
 * actually does.
 */
export function parseScheduleResponse(response: WebSocResponse): ClassMeeting[] {
  const classes: ClassMeeting[] = []

  for (const school of response.data.schools) {
    for (const department of school.departments) {
      for (const course of department.courses) {
        for (const section of course.sections) {
          for (const meeting of section.meetings) {
            const parsed = tryParseMeeting(meeting, {
              schoolName: school.schoolName,
              deptName: department.deptName,
              courseId: course.courseId,
              courseTitle: course.courseTitle,
              sectionCode: section.sectionCode,
            })

            if (parsed !== null) {
              classes.push(parsed)
            }
          }
        }
      }
    }
  }

  return classes
}

/** Context passed down through the nested loops to build the flat object. */
interface MeetingContext {
  schoolName: string
  deptName: string
  courseId: string
  courseTitle: string
  sectionCode: string
}

/**
 * Try to convert a single API meeting into a ClassMeeting.
 * Returns null if the meeting should be excluded (TBA time, online, etc.).
 *
 * Extracting this into its own function keeps the main loop clean and
 * makes the filtering criteria easy to find and modify.
 */
function tryParseMeeting(
  meeting: ApiMeeting,
  ctx: MeetingContext,
): ClassMeeting | null {
  // Skip meetings with no scheduled time or physical location
  if (meeting.timeIsTBA) return null
  if (meeting.bldg[0] === 'ON LINE') return null
  if (meeting.bldg[0] === 'TBA ') return null

  const startTime = new TimeOfDay(meeting.startTime.hour, meeting.startTime.minute)
  const endTime = new TimeOfDay(meeting.endTime.hour, meeting.endTime.minute)

  return {
    key: `${ctx.sectionCode}-${meeting.days}-${meeting.startTime.hour}-${meeting.endTime.hour}`,
    school: ctx.schoolName,
    department: ctx.deptName,
    course: `${ctx.courseId} - ${ctx.courseTitle}`,
    building: meeting.bldg[0],
    days: parseDays(meeting.days),
    startTime,
    endTime,
  }
}
