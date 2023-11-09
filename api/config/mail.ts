import Env from '@ioc:Adonis/Core/Env'

const mailConfig = {
  connection: Env.get('MAIL_CONNECTION', 'tls'),

  smtp: {
    pool: true,
    host: Env.get('SMTP_HOST'),
    port: Env.get('SMTP_PORT', 587),
    secure: false,
    auth: {
      user: Env.get('SMTP_USERNAME'),
      pass: Env.get('SMTP_PASSWORD'),
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
}

export default mailConfig
