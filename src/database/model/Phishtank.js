'use strict'

class Phishtank {
  constructor(id, phishId, phishDetailUrl, url, submissionTime, verificationTime,online, target, endTime) {
    this.id = id
    this.phishId = phishId
    this.phishDetailUrl = phishDetailUrl
    this.url = url
    this.submissionTime = submissionTime
    this.verificationTime = verificationTime
    this.online = online
    this.target = target
    this.endTime = endTime
  }
}

module.exports = {
  Phishtank
}
