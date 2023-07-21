import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'accounts'

  public async up () {
    if (!await this.schema.hasTable(this.tableName)) {
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('name')
        table.string('password')
        table.string('email')
        table.string('ip')
        table.integer('character0')
        table.integer('character1')
        table.integer('character2')
        table.integer('vip')
        table.integer('viptime')
        table.string('tokentmp')
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
    } else {
      this.schema.alterTable(this.tableName, (table)=> {
        table.string('tokentmp')
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
    }

  }


  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
