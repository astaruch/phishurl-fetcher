'use strict'
/* eslint-disable no-await-in-loop */
/* eslint-disable no-sync */
const Phishtank = require('../database/entity/Phishtank')
const LastUpdated = require('../database/entity/LastUpdated')
const getLastUpdated = require('./last-updated').getLastUpdated
const logger = require('../utils/logger')
const getFilenames = require('../utils/utils').getFilenames
const obtainCsv = require('../utils/utils').obtainCsv
const dbConn = require('../database')
const path = require('path')
const fs = require('fs')
const typeorm = require('typeorm')
const apiKey = require('../config').phishtankApiKey
const request = require('request-promise')

/**
 * Sets the 'online' param to false for records which aren't in current records.
 * @param {*} repository typeorm connection to phishtank
 * @param {*} onlineDbIds phishtank records which are online
 * @param {*} newIds current new phishtank records
 * @param {*} endTime date to set when site went offline
 * @returns {*} void
 */
const setOfflineIds = async (repository, onlineDbIds, newIds, endTime) => {
  const goingOffline = onlineDbIds.filter(id => !newIds.includes(id))
  logger.info(`Setting offline IDs of ${goingOffline.length} records to ${endTime}.`)
  await goingOffline.map(async id => {
    await repository.update({ phishId: id }, { online: false, endTime })
  })
}

/**
 * Transform the list of object into database format
 * @param {*} records array of object representation of record
 * @returns {*} array of db representation of record
 */
const objectRecordsToDbRecords = records => records.map(row => ({
  phishId: Number(row.phish_id),
  url: row.url,
  phishDetailUrl: row.phish_detail_url,
  submissionTime: row.submission_time,
  verificationTime: row.verification_time,
  online: Boolean(row.online),
  target: row.target,
}))

/**
 * Inserts records into database
 * @param {*} manager typeorm manager to database
 * @param {*} newRecords new records to insert
 * @param {*} dbIds IDs of records which are already in database
 * @returns {*}
 */
const inserPhishtankRecordsToDb = async (manager, newRecords, dbIds) => {
  const idsToInsert = newRecords
    .filter(row => row)
    .map(row => Number(row.phish_id))
    .filter(newId => !dbIds.includes(newId))

  const recordsToInsert = newRecords
    .filter(row => row && idsToInsert.includes(Number(row.phish_id)))

  const newDbRecords = objectRecordsToDbRecords(recordsToInsert)

  logger.info(`Inserting total ${newDbRecords.length} records to database.`)

  await manager.transaction(async transactionalEntityManager => {
    // insert only 1k rows at once (in transaction)
    let recordsSplice = newDbRecords.splice(0, 1000)
    while (recordsSplice.length > 0) {
      logger.info(`Inserting ${recordsSplice.length} rows.`)
      try {
        await transactionalEntityManager.insert(Phishtank, recordsSplice)
      } catch (err) {
        logger.error('Can\'t perform insert')
        throw new Error(err)
      }
      recordsSplice = newDbRecords.splice(0, 1000)
    }
  })
}

/**
 * Gets the date from the filename which should looks like '../data/csv/2018-03-02.csv'
 * @param {*} absolutePath absolute path
 * @returns {Date}
 */
const getDateFromFilename = absolutePath => {
  const filename = path.basename(absolutePath, path.extname(absolutePath))
  const date = new Date(filename)
  return date
}

/**
 * Insert/update new records into database
 * @param {Connection} connection typeorm connection
 * @param {[]} newRecords records obtained from csv or online json
 * @param {string} currentISODate current date
 * @returns {*}
 */
const doUpdate = async (connection, newRecords, currentISODate) => {
  const repositoryPhishtank = await connection.manager.getRepository(Phishtank)
  const db = await repositoryPhishtank
    .createQueryBuilder('phishtank')
    .getMany()

  const dbIds = db
    .filter(dbRow => dbRow)
    .map(dbRow => dbRow.phishId)

  const dbOnlineIds = db
    .filter(dbRow => dbRow && dbRow.online)
    .map(dbRow => dbRow.phishId)

  const newRecordsIds = newRecords
    .filter(row => row)
    .map(row => Number(row.phish_id))

  // 1.
  // If phish_id is in db (with online: true) and it's not newRecords
  // it wen offline right now.
  await setOfflineIds(repositoryPhishtank, dbOnlineIds, newRecordsIds, currentISODate)

  // 2.
  // Insert all new records into database where phish_id isnt't already there
  await inserPhishtankRecordsToDb(typeorm.getManager(), newRecords, dbIds)

  // 3.
  // Update timestamp in database
  const repositoryLastUpdated = await connection.manager.getRepository(LastUpdated)
  logger.info(`Updating table lastUpdated to ${currentISODate}.`)
  await repositoryLastUpdated
    .update({ tableName: 'phishtank' }, { lastUpdated: currentISODate })

  logger.info('OK')
}

/**
 * Process a CSV file from a given path and insert values to database.
 * @param {string} filename path to csv
 * @param {Connection} connection database connection
 * @returns {*}
 */
const processCsv = async (filename, connection) => {
  logger.info(`Processing: ${filename}`)
  const repositoryLastUpdated = await connection.manager.getRepository(LastUpdated)

  const currentDate = getDateFromFilename(filename)
  const currentIsoDate = currentDate.toISOString()

  const lastDate = await getLastUpdated(repositoryLastUpdated, 'phishtank')

  if (lastDate >= currentDate) {
    logger.info(`Skipping: database has newer records than a given file`)
    return
  }

  const newRecords = obtainCsv(filename)

  await doUpdate(connection, newRecords, currentIsoDate)
}

/**
 * Initialize a database from folder containing csv files
 * @param {*} folder path to folder
 * @returns {*}
 */
const initFromCsv = async folder => {
  const filenames = getFilenames(folder)
  const connection = await dbConn

  for (let i = 0; i < filenames.length; i++) {
    const fullpath = path.join(folder, filenames[i])
    try {
      if (!fs.statSync(fullpath).isFile()) {
        logger.warn(`Skipping non-file: ${fullpath}`)
        continue
      }
    } catch (err) {
      logger.error(err)
      throw new Error()
    }

    await processCsv(fullpath, connection)
  }
}

/**
 * Query current state of phishtank service and update our database accordingly.
 * You have to provide an apiKey.
 * @returns {*}
 */
const fetchFromPhishtankSite = async () => {
  const url = `http://data.phishtank.com/data/${apiKey}/online-valid.json`
  logger.info(`Querying ${url}`)
  const recordsString = await request(url)
  const recordsObj = JSON.parse(recordsString)

  const connection = await dbConn
  const date = new Date().toISOString()

  await doUpdate(connection, recordsObj, date)
}

module.exports = {
  initFromCsv,
  fetchFromPhishtankSite
}
