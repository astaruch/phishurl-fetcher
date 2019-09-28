'use strict'

if (!process.env.PHISHTANK_API_KEY) {
  // eslint-disable-next-line global-require
  require('dotenv').config()
}

module.exports = {
  phishtankApiKey: process.env.PHISHTANK_API_KEY
}
