// config/auth.ts
import { AuthConfig } from '@ioc:Adonis/Addons/Auth'
// import Accounts from 'App/Models/Accounts'

const authConfig: AuthConfig = {
  guard: 'api',

  guards: {
    api: {
      driver: 'oat',
      tokenProvider: {
        type: 'database',
        driver: 'database',
        table: 'api_tokens',
      },
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['name'],
        async model() { // Use 'async' para retornar o modelo de forma assíncrona
          return (await import('App/Models/Accounts'))
        },
      },
    },

  },
}

export default authConfig
