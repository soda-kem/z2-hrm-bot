import config from './config'
import puppeteer from 'puppeteer-extra'
import { CronJob } from 'cron'

import { PuppeteerOptions } from './puppeteer'
import { sleep } from './utils'
import logger from './logger'
import * as moment from 'moment'

const stealth = require('puppeteer-extra-plugin-stealth')()
// eslint-disable-next-line @typescript-eslint/no-empty-function
stealth.onBrowser = () => {}
puppeteer.use(stealth)

const checkin = async () => {
  if (config.auto && config.random) {
    const checkinAfter = ~~(
      Math.random() *
        config.checkinRangeEnd.diff(config.checkinRangeStart, 'm') +
      1
    )
    logger.info(`Checkin/Checkout sẽ bắt đầu sau ${checkinAfter} phút`)
    await sleep(checkinAfter * 60 * 1000)
  }

  const credentials = config.credentials

  const browser = await puppeteer.launch(PuppeteerOptions)
  const page = await browser.newPage()
  if (!config.headless) {
    await page.setViewport(config.puppeteer.viewport)
  }
  await page.goto(`${config.domain}/login`, { waitUntil: 'networkidle2' })

  logger.info('Đang đăng nhập Google...')
  await page.mainFrame().waitForSelector('#identifierId')
  logger.info('Nhập email...')
  await page.type('#identifierId', credentials.email)
  await page.mainFrame().waitForSelector('#identifierNext')
  logger.info('Ấn nút Tiếp theo...')
  await page.click('#identifierNext')
  await page
    .mainFrame()
    .waitForSelector('#password input[type=password]', { visible: true })
  logger.info('Nhập password...')
  await page.type('#password input[type=password]', credentials.password)
  await page.waitFor(1000)
  await page.mainFrame().waitForSelector('#passwordNext')
  logger.info('Ấn nút hoàn thành...')
  await page.click('#passwordNext')
  logger.info('Đang chuyển hướng về trang chủ...')
  await page.waitFor(3000)
  let shouldCheck = true
  try {
    await page
      .mainFrame()
      .waitForSelector(config.checkinBtn, { visible: true, timeout: 3000 })
  } catch (e) {
    shouldCheck = false
    logger.warn('Bạn đã checkin rồi')
  }
  if (shouldCheck) {
    await page.click(config.checkinBtn)
    await page.waitFor(3000)
  }
  await browser.close()
  logger.info('Kết thúc.')
  logger.info('_____________________________________________________________')
}

const checkout = async () => {
  if (config.auto && config.random) {
    const checkoutAfter = ~~(
      Math.random() *
        config.checkoutRangeEnd.diff(config.checkoutRangeStart, 'm') +
      1
    )
    logger.info(`Checkin/Checkout sẽ bắt đầu sau ${checkoutAfter} phút`)
    await sleep(checkoutAfter * 60 * 1000)
  }
  const credentials = config.credentials

  const browser = await puppeteer.launch(PuppeteerOptions)
  const page = await browser.newPage()
  if (!config.headless) {
    await page.setViewport(config.puppeteer.viewport)
  }
  await page.goto(`${config.domain}/login`, { waitUntil: 'networkidle2' })

  logger.info('Đang đăng nhập Google...')
  await page.mainFrame().waitForSelector('#identifierId')
  logger.info('Nhập email...')
  await page.type('#identifierId', credentials.email)
  await page.mainFrame().waitForSelector('#identifierNext')
  logger.info('Ấn nút Tiếp theo...')
  await page.click('#identifierNext')
  await page
    .mainFrame()
    .waitForSelector('#password input[type=password]', { visible: true })
  logger.info('Nhập password...')
  await page.type('#password input[type=password]', credentials.password)
  await page.waitFor(1000)
  await page.mainFrame().waitForSelector('#passwordNext')
  logger.info('Ấn nút hoàn thành...')
  await page.click('#passwordNext')
  logger.info('Đang chuyển hướng về trang chủ...')
  await page.waitFor(3000)
  let shouldCheck = true
  try {
    await page
      .mainFrame()
      .waitForSelector(config.checkinBtn, { visible: true, timeout: 3000 })
  } catch (e) {
    shouldCheck = false
    logger.warn('Bạn đã checkin hoặc checkout rồi')
  }
  if (shouldCheck) {
    page.on('dialog', (dialog) => {
      if (!config.auto && moment().isSameOrAfter(config.checkoutStart)) {
        logger.info('Hộp thoại xác nhận đang mở...')
        sleep(1000)
        dialog.accept()
        logger.info('Đã chấp nhận...')
        sleep(1000)
      } else {
        logger.info('Hộp thoại xác nhận đang mở...')
        sleep(1000)
        dialog.dismiss()
        logger.info('Đã hủy bỏ vì chưa đến lúc checkout...')
        sleep(1000)
      }
    })
    await page.click(config.checkoutBtn)
    await page.waitFor(3000)
  }
  await browser.close()
  logger.info('Kết thúc.')
  logger.info('_____________________________________________________________')
}

;(async () => {
  try {
    logger.info('Ứng dụng đang khởi động...')
    let checkinTime = config.checkinStart
    let checkoutTime = config.checkoutStart
    if (config.random) {
      checkinTime = config.checkinRangeStart
      checkoutTime = config.checkoutRangeStart
    }
    if (config.auto) {
      logger.info('Đang lập lịch tự động...')
      if (config.random) {
        logger.info(
          `Checkin ngẫu nhiên trong khoảng ${config.checkinRangeStart.format(
            'HH:mm'
          )} - ${config.checkinRangeEnd.format('HH:mm')}`
        )
        logger.info(
          `Checkout ngẫu nhiên trong khoảng ${config.checkoutRangeStart.format(
            'HH:mm'
          )} - ${config.checkoutRangeEnd.format('HH:mm')}`
        )
      } else {
        logger.info(
          `Checkin bắt đầu lúc ${config.checkinStart.format('HH:mm')}`
        )
        logger.info(
          `Checkout bắt đầu lúc ${config.checkoutStart.format('HH:mm')}`
        )
      }
      let days = '*'
      if (config.days.length) {
        days = config.days.join(',')
      }
      const checkinCronCommand = `0 ${checkinTime.minute()} ${checkinTime.hour()} * * ${days}`
      const checkoutCronCommand = `0 ${checkoutTime.minute()} ${checkoutTime.hour()} * * ${days}`
      logger.info(`Checkin cron command: ${checkinCronCommand}`)
      logger.info(`Checkout cron command: ${checkoutCronCommand}`)
      new CronJob(checkinCronCommand, checkin, null, true, 'Asia/Ho_Chi_Minh')
      new CronJob(checkoutCronCommand, checkout, null, true, 'Asia/Ho_Chi_Minh')
      process.stdin.resume()
    } else {
      logger.warn(
        'Bạn đang không sử dụng Auto Schedule.\nHãy chắc chắn đã config chạy tự động script này.'
      )
      if (moment().isBefore(checkoutTime)) {
        await checkin()
      } else {
        await checkout()
      }
    }
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
})()
