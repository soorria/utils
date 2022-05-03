import esbuild from 'esbuild'
import * as babel from '@babel/core'
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
    esbuild?: esbuild.BuildFailure
    babel?: Error
  } & Partial<RemoveTypesSchemaErrors>
  ts?: string
}

export type RemoveTypesResult = RemoveTypesSuccess | RemoveTypesError

type RemoveTypesFunction = (ts: string, options: RemoveTypesOptions) => Promise<string>

const removeTypesEsbuild: RemoveTypesFunction = async (ts, options) => {
  const result = await esbuild.transform(ts, {
    jsx: 'preserve',
    loader: options.isTsx ? 'tsx' : 'ts',
    minify: false,
  })
  return result.code
}

const removeTypesBabel: RemoveTypesFunction = async (ts, options) => {
  const result = await babel.transformAsync(ts, {
    filename: `file.${options.isTsx ? 'tsx' : 'ts'}`,
    retainLines: false,
    presets: ['@babel/typescript'],
  })
  return result?.code!
}

const removeTypesFunctions = {
  esbuild: removeTypesEsbuild,
  babel: removeTypesBabel,
}

const REMOVE_TYPES_FUNCTION: keyof typeof removeTypesFunctions = 'babel'

export const removeTypes = async (
  ts: string,
  options: RemoveTypesOptions
): Promise<RemoveTypesResult> => {
  // empty string
  if (!ts) return { status: 'success', ts, js: ts }

  try {
    const js = await removeTypesFunctions[REMOVE_TYPES_FUNCTION](ts, options)

    return {
      status: 'success',
      ts,
      js,
    }
  } catch (err) {
    console.error(err)
    return { status: 'error', ts, errors: { esbuild: err as esbuild.BuildFailure } }
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
