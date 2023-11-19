import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'recoveries'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_user').unsigned().references('id').inTable('accounts').onDelete('CASCADE')
      table.string('code', 7).notNullable().unique()
      table.integer('used', 1).notNullable()
      table.integer('attempt', 1).notNullable().defaultTo(0)
      table.timestamp('expires_at').notNullable()
      table.timestamp('created_at', { useTz: true })

    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
