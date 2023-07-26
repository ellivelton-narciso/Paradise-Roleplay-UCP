import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'accounts'

  public async up () {
    if (!await this.schema.hasTable(this.tableName)) {
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('name').notNullable()
        table.string('password').notNullable()
        table.string('email')
        table.string('ip')
        table.integer('character0').notNullable().defaultTo(-1)
        table.integer('character1').notNullable().defaultTo(-1)
        table.integer('character2').notNullable().defaultTo(-1)
        table.integer('vip').unsigned().notNullable().defaultTo(0)
        table.integer('viptime').unsigned().notNullable().defaultTo(0)
        table.integer('saldo').unsigned().notNullable().defaultTo(0)
        table.integer('admin').unsigned().notNullable().defaultTo(0)
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
    } else {
      this.schema.alterTable(this.tableName, (table)=> {
        table.integer('admin').unsigned().notNullable().unsigned().notNullable().defaultTo(0)
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
    }

  }


  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
