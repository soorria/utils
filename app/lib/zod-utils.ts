import { z } from 'zod'

export const booleanOrCheckboxValue = () =>
  z.union([z.boolean(), z.enum(['on'])], {
    errorMap(issue, ctx) {
      if (issue.code === z.ZodIssueCode.invalid_union) {
        return { message: "must be true, false or 'on'" }
      }
      return z.defaultErrorMap(issue, ctx)
    },
  })

export const optionalBooleanOrCheckboxValue = (defaultValue = false) =>
  booleanOrCheckboxValue().optional().default(defaultValue)

export const coerceOptionalBooleanOrCheckboxValueToBoolean = (
  val: boolean | 'on' | undefined,
  defaultValue: boolean = false
): boolean => (typeof val === 'boolean' ? val : typeof val === 'undefined' ? defaultValue : true)
