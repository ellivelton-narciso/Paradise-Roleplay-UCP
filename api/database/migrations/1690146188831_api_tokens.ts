// database/migrations/timestamp_create_api_tokens.ts

import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateApiTokens extends BaseSchema {
  protected tableName = 'api_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE')
      table.string('name', 255)
      table.string('type', 80).notNullable()
      table.string('token', 500).notNullable().unique()
      table.timestamp('expires_at').nullable()
      table.timestamp('created_at', { useTz: true }).nullable()
    })

  }


  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
