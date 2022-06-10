import type { ClientConfig } from 'pg'
import { Client } from 'pg'
import { parse } from 'pg-connection-string'

export const parseConnectionString = (connectionString: string): ClientConfig => {
  return parse(connectionString) as ClientConfig
}

const createClient = (config: ClientConfig): Client => {
  const client = new Client(config)
  return client
}

type WithClientFunction<Result> = (client: Client) => Promise<Result>
export const withClient =
  <Result>(config: ClientConfig, fn: WithClientFunction<Result>) =>
  async (): Promise<Result> => {
    const client = createClient(config)
    await client.connect()
    try {
      return await fn(client)
    } finally {
      await client.end()
    }
  }
