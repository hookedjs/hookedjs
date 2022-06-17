import {createTransport, getTestMessageUrl} from 'nodemailer'

import config from './config.node'

const isTesting = config.smtpHost.includes('ethereal')

const transporter = createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: isTesting ? false : true,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
})

export default {
  send: (mailOptions: SendMailProps) =>
    transporter.sendMail({
      from: `"HookedJS" <${config.smtpUser}>`,
      ...mailOptions,
    }),
  isTesting,
  getTestMessageUrl: (mailRes: any) => (isTesting ? getTestMessageUrl(mailRes) : 'N/A'),
}

type SendMailProps = Parameters<typeof transporter.sendMail>[0]
