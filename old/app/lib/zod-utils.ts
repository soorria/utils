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
  booleanOrCheckboxValue()
    .optional()
    .default(defaultValue)
    .transform(val => (typeof val === 'boolean' ? val : val === 'on'))

export const coerceOptionalBooleanOrCheckboxValueToBoolean = (
  val: boolean | 'on' | undefined,
  defaultValue: boolean = false
): boolean => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'undefined') return defaultValue
  return val === 'on'
}
