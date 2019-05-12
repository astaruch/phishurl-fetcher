'use strict'

const typeorm = require('typeorm')

const name = 'last_updated'

class CreateLastUpdated1555897004589 {
  async up(queryRunner) {
    await queryRunner.createTable(new typeorm.Table({
      name,
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
        },
        {
          name: 'table_name',
          type: 'varchar',
        },
        {
          name: 'last_updated',
          type: 'timestamp with time zone',
        },
      ],
    }), true)
  }

  async down(queryRunner) {
    await queryRunner.dropTable(name)
  }
}

module.exports = {
  CreateLastUpdated1555897004589
}
