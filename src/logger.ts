import * as moment from 'moment'
import { createLogger, format, transports } from 'winston'

const { colorize, combine, timestamp, printf } = format

// Define your custom format with printf.
const customFormat = printf((info) => {
  return `[ ${moment(info.timestamp).format('YYYY-MM-DD HH:mm:ss')} ] ${
    info.level
  }: ${info.message}`
})

const logger = createLogger({
  format: combine(timestamp(), colorize(), customFormat),
  transports: [new transports.Console()],
})

export default logger
