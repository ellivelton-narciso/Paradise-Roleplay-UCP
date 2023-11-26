import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'vehicles'

  public async up () {
    if (!await this.schema.hasTable(this.tableName)) {
      this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('owner')
      table.integer('model')
    })
    }
    
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
