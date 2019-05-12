'use strict'

const typeorm = require('typeorm')
const LastUpdated = require('../model/LastUpdated').LastUpdated

module.exports = new typeorm.EntitySchema({
  name: 'LastUpdated',
  target: LastUpdated,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    tableName: {
      type: 'varchar',
      name: 'table_name',
    },
    lastUpdated: {
      type: 'timestamp with time zone',
      name: 'last_updated'
    }
  }
})
