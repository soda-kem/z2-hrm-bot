import config from './config'
import * as Puppeteer from 'puppeteer-extra/dist/puppeteer'

const PuppeteerOptions: Puppeteer.LaunchOptions = {
  headless: config.headless,
  args: config.headless ? [] : ['--start-maximized'],
}

export { PuppeteerOptions }
