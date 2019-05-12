'use strict'

const typeorm = require('typeorm')

const conn = typeorm.createConnection()
  .then(data => data)
  .catch(err => {
    throw new Error(err)
  })

module.exports = conn
