/* eslint-disable no-sync */
'use strict'
const fs = require('fs')
const parse = require('csv-parse/lib/sync')

const logger = require('./logger')

/**
 * Get a list of files in directory
 * @param {*} dir full path
 * @returns {*} list of files in directory
 */
const getFilenames = dir => {
  let files
  try {
    files = fs.readdirSync(dir)
  } catch (err) {
    logger.error(`No such directory: ${dir}`)
    return []
  }
  return files
}

/**
 * Gets a csv object from a filepath
 * @param {*} fullpath path to csv file
 * @returns {*} csv object
 */
const obtainCsv = fullpath => {
  const csvContent = fs.readFileSync(fullpath)
  return parse(csvContent.toString('utf8'), {
    columns: true,
    delimiter: ',',
  })
}

module.exports = {
  getFilenames,
  obtainCsv
}
