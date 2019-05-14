'use strict'

if (!process.env.PHISHTANK_API_KEY) {
  // eslint-disable-next-line global-require
  require('dotenv').load()
}

module.exports = {
  phishtankApiKey: process.env.PHISHTANK_API_KEY
}
