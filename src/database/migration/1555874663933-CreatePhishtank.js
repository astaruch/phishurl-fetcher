'use strict'

const typeorm = require('typeorm')


class CreatePhishtank1555874663933 {
  async up(queryRunner) {
    await queryRunner.createTable(new typeorm.Table({
      name: 'phishtank',
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
        },
        {
          name: 'phish_id',
          type: 'int',
          isUnique: true,
        },
        {
          name: 'phish_detail_url',
          type: 'varchar',
        },
        {
          name: 'url',
          type: 'varchar',
        },
        {
          name: 'submission_time',
          type: 'timestamp with time zone',
        },
        {
          name: 'verification_time',
          type: 'timestamp with time zone',
        },
        {
          name: 'online',
          type: 'boolean',
        },
        {
          name: 'target',
          type: 'varchar',
        },
        {
          name: 'end_time',
          type: 'timestamp with time zone',
          isNullable: true,
        },
      ],
    }), true)
  }

  async down (queryRunner) {
    await queryRunner.dropTable('phishtank')
  }
}

module.exports = {
  CreatePhishtank1555874663933
}
