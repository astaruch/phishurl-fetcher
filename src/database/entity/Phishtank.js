'use strict'

const typeorm = require('typeorm')
const Phishtank = require('../model/Phishtank').Phishtank

module.exports = new typeorm.EntitySchema({
  name: 'Phishtank',
  target: Phishtank,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    phishId: {
      type: 'int',
      name: 'phish_id',
      unique: true,
    },
    phishDetailUrl: {
      type: 'varchar',
      name: 'phish_detail_url'
    },
    url: {
      type: 'varchar'
    },
    submissionTime: {
      type: 'timestamp with time zone',
      name: 'submission_time',
    },
    verificationTime: {
      type: 'timestamp with time zone',
      name: 'verification_time'
    },
    online: {
      type: 'boolean'
    },
    target: {
      type: 'varchar'
    },
    endTime: {
      type: 'timestamp with time zone',
      name: 'end_time',
      nullable: true
    }
  }
})

