'use strict'
/* eslint-disable no-await-in-loop */
/* eslint-disable no-sync */
const path = require('path')
const yargs = require('yargs')

const phishtank = require('./operations/phishtank')

const logger = require('./utils/logger')

if (require.main === module) {
  const argv = yargs
    .usage('Phishing URL fetcher\n\nUsage: $0 [options]')
    .help('help').alias('help', 'h')
    .option('init', {
      alias: 'i',
      description: 'Initialize Postgre database with prepared csv files',
    })
    .option('csv-folder', {
      alias: 'p',
      description: 'Path containing Phishtank csv files',
    })
    .argv

    if (argv.init) {
      if (!argv.csvFolder) {
        throw new Error(`You have to specifiy folder containing csv files!`)
      }
      const dir = path.join(process.cwd(), argv.csvFolder)
      phishtank.initFromCsv(dir).catch(err => logger.error(err))
    }

}
