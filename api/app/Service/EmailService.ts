import nodemailer from 'nodemailer'
import mailConfig from '../../config/mail'

class EmailService {
  async sendMail(to: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport(mailConfig.smtp)

    const mailOptions = {
      from: 'paradise.rp@outlook.com',
      to,
      subject,
      html: message,
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Erro ao enviar o e-mail:', error)
    }
  }
}

export default new EmailService()

