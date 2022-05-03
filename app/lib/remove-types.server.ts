import esbuild, { BuildFailure } from 'esbuild'
import { z } from 'zod'
import {
  coerceOptionalBooleanOrCheckboxValueToBoolean,
  optionalBooleanOrCheckboxValue,
} from './zod-utils'

type RemoveTypesSuccess = {
  status: 'success'
  js: string
  ts: string
}
type RemoveTypesError = {
  status: 'error'
  errors: {
    esbuild?: BuildFailure
  } & Partial<RemoveTypesSchemaErrors>
  ts?: string
}

export type RemoveTypesResult = RemoveTypesSuccess | RemoveTypesError

export const removeTypes = async (
  ts: string,
  options: RemoveTypesOptions
): Promise<RemoveTypesResult> => {
  // empty string
  if (!ts) return { status: 'success', ts, js: ts }

  try {
    const result = await esbuild.transform(ts, {
      jsx: 'preserve',
      loader: options.isTsx ? 'tsx' : 'ts',
      minify: false,
    })

    return {
      status: 'success',
      ts,
      js: result.code,
    }
  } catch (err) {
    return { status: 'error', ts, errors: { esbuild: err as BuildFailure } }
  }
}

export const removeTypesRequestParamsSchema = z
  .object({
    ts: z.string().default(''),
    isTsx: optionalBooleanOrCheckboxValue(),
    copyWhenDone: optionalBooleanOrCheckboxValue(),
  })
  .transform(val => {
    val.isTsx = coerceOptionalBooleanOrCheckboxValueToBoolean(val.isTsx)
    val.copyWhenDone = coerceOptionalBooleanOrCheckboxValueToBoolean(val.isTsx)
    if (!val.ts) {
      val.copyWhenDone = true
    }
    return val as RemoveTypesRequestParams
  })

export type RemoveTypesRequestParams = {
  ts: string
  isTsx: boolean
  copyWhenDone: boolean
}
export type RemoveTypesOptions = Omit<RemoveTypesRequestParams, 'ts'>
type RemoveTypesSchemaErrors = z.inferFlattenedErrors<typeof removeTypesRequestParamsSchema>
