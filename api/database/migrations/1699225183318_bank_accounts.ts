import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'bank_accounts'

  public async up () {
    if (!await this.schema.hasTable(this.tableName)) {
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('owner')
        table.string('password')
        table.string('agency')
        table.string('account')
        table.integer('balance')
      })
    }
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
