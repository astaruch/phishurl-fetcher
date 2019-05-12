'use strict'

const logger = require('../utils/logger')

/**
 * Gets the date when was given table last updated
 * @param {*} repository typeorm connection to repository
 * @param {*} tableName 'phishtank'
 * @returns {*} date in ISO format
 */
const getLastUpdated = async (repository, tableName) => {
  try {
    const row = await repository.findOneOrFail({ tableName })
    return row.lastUpdated
  } catch (err) {
    logger.warn(`Table ${tableName} doesn't exist. Inserting epoch time zero into database. Error: ${err}`)
    const date = new Date(0)
    await repository.insert({ tableName, lastUpdated: date.toISOString() })
    return date
  }
}

/**
 * Sets the date when was given table last updated
 * @param {*} repository typeorm connection to repository
 * @param {*} tableName 'phishtank'
 * @param {*} lastUpdated date in ISO format
 * @returns {*}
 */
const setLastUpdated = async (repository, tableName, lastUpdated) => {
  try {
    await repository.update({ tableName }, {lastUpdated})
  } catch (err) {
    logger.warn(`Table ${tableName} doesn't exist. Error: ${err}`)
  }
}

module.exports = {
  getLastUpdated,
  setLastUpdated
}
