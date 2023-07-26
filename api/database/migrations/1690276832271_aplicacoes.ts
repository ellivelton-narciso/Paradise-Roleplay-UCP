import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'aplicacoes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE')
      table.string('nome')
      table.string('sobrenome')
      table.string('nascimento')
      table.string('origem')
      table.integer('sexo')
      table.string('historia', 3000)
      table.integer('status').notNullable().defaultTo(-1)
      table.string('mensagem', 1000).defaultTo('')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
