import * as moment from 'moment'

require('dotenv').config()

export interface Configuration {
  domain: string
  credentials: {
    email: string
    password: string
  }
  headless: boolean
  checkinBtn: string
  checkoutBtn: string
  checkinStart: moment.Moment
  checkoutStart: moment.Moment
  auto: boolean
  random: boolean
  checkinRangeStart: moment.Moment
  checkinRangeEnd: moment.Moment
  checkoutRangeStart: moment.Moment
  checkoutRangeEnd: moment.Moment
  days: number[]
  puppeteer: {
    viewport: {
      width: number
      height: number
    }
  }
}

const config: Configuration = {
  domain: process.env.DOMAIN || process.env.DOMAIN.replace(/\/+$/g, ''),
  credentials: {
    email: process.env.EMAIL || '',
    password: process.env.PASSWORD || '',
  },
  headless: process.env.HEADLESS === 'true',
  checkinBtn: process.env.CHECKIN_SELECTOR || '',
  checkoutBtn: process.env.CHECKOUT_SELECTOR || '',
  checkinStart: moment(process.env.CHECKIN_START || '08:15', 'HH:mm'),
  checkoutStart: moment(process.env.CHECKOUT_START || '17:45', 'HH:mm'),
  auto: process.env.AUTO === 'true',
  random: process.env.RANDOM === 'true',
  checkinRangeStart: moment(
    process.env.CHECKIN_RANGE_START || '08:00',
    'HH:mm'
  ),
  checkinRangeEnd: moment(process.env.CHECKIN_RANGE_END || '08:25', 'HH:mm'),
  checkoutRangeStart: moment(
    process.env.CHECKOUT_RANGE_START || '17:35',
    'HH:mm'
  ),
  checkoutRangeEnd: moment(process.env.CHECKOUT_RANGE_END || '18:00', 'HH:mm'),
  days: process.env.DAYS ? process.env.DAYS.split(',').map((d) => +d) : [],
  puppeteer: {
    viewport: {
      width: +process.env.PUPPETEER_VIEWPORT_W || 1920,
      height: +process.env.PUPPETEER_VIEWPORT_H || 1080,
    },
  },
}

export default config
