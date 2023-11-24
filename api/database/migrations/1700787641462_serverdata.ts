import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'serverdata'

  public async up () {
    if (!await this.schema.hasTable(this.tableName)) {
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('name').notNullable()
        table.string('mode').notNullable()
        table.string('language').notNullable()
        table.integer('locked').notNullable()
        table.integer('whitelist').notNullable()
        table.integer('finances').notNullable()
        table.integer('financesduring').notNullable()
      })
    }

  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
