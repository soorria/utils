// import type { ClientConfig } from 'pg'
// import { Client } from 'pg'
// import { parse } from 'pg-connection-string'
// import { redirect } from 'solid-start'
// import { Session } from 'solid-start/session/sessions'
// import { z } from 'zod'
// import { slug } from './details.server'

// const connectionConfigInputSchema = z.object({
//   host: z.string({
//     errorMap: () => ({
//       message: 'Host could not be parsed from connection string.',
//     }),
//   }),
//   database: z.string({
//     errorMap: () => ({
//       message:
//         'Database name could not be found in connection string. Please include it explicitly.',
//     }),
//   }),
//   user: z.string(),
//   password: z.string(),
//   port: z
//     .string()
//     .nullable()
//     .transform(arg => (arg ? parseInt(arg) : undefined)),
// })

// const connectionConfigSessionSchema = connectionConfigInputSchema
//   .pick({
//     host: true,
//     database: true,
//     user: true,
//     password: true,
//   })
//   .extend({
//     port: z
//       .number()
//       .nullable()
//       .optional()
//       .transform(p => p ?? undefined),
//   })

// export type ConnectionConfig = z.infer<typeof connectionConfigInputSchema>

// export type ConnectionStringErrors = z.inferFlattenedErrors<
//   typeof connectionConfigInputSchema
// >

// export const parseConnectionString = (connectionString: string) => {
//   return connectionConfigInputSchema.safeParse(parse(connectionString))
// }

// const createClient = (config: ClientConfig): Client => {
//   const client = new Client({ ...config, application_name: 'supacron' })
//   return client
// }

// type WithClientFunction<Result> = (client: Client) => Promise<Result>
// export const withClient = async <Result>(
//   config: ClientConfig,
//   fn: WithClientFunction<Result>
// ): Promise<Result> => {
//   const client = createClient(config)
//   try {
//     await client.connect()
//     return await fn(client)
//   } finally {
//     client.end().catch(err => console.error(err))
//   }
// }

// export const setConfigToSession = (
//   session: Session,
//   config: ConnectionConfig
// ) => {
//   session.set('config', config)
// }

// export const getConfigFromSession = (session: Session) => {
//   const fromSession = session.get('config')
//   const result = connectionConfigSessionSchema.safeParse(fromSession)
//   return result.success ? result.data : null
// }

// export const setFlashError = (session: Session, message: string) => {
//   session.flash('error', message)
// }

// export const getFlashError = (session: Session): string | null => {
//   const error = session.get('error')
//   return typeof error === 'string' ? error : null
// }

// export const requireConfigFromSession = async (session: Session) => {
//   const fromSession = getConfigFromSession(session)
//   if (!fromSession) {
//     throw redirect(`/${slug}`, {})
//   }
//   return fromSession
// }

export default false
