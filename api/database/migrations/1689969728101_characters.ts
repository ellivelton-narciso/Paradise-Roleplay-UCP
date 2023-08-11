import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'characters'

  public async up () {
    if (!await this.schema.hasTable(this.tableName)) {
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('name')
        table.integer('money')
        table.integer('skin')
        table.integer('payday')
        table.integer('level')
        table.integer('xp')
        table.integer('job')
        table.integer('sex')
        table.string('birthday')
        table.integer('posx')
        table.integer('posy')
        table.integer('posz')
        table.integer('posa')
        table.integer('interior')
        table.integer('interiorvw')
        table.integer('house')
        table.integer('business')
        table.integer('entrance')
        table.integer('blocked')
        table.integer('hunger')
        table.integer('thirst')
        table.string('rg')
        table.string('cpf')
        table.string('cnh')
        table.integer('spawn')
        table.integer('noobchat')
        table.integer('sayanim')
        table.integer('fight')
        table.integer('faction')
        table.integer('office')
        table.integer('phone')
        table.integer('chip_1')
        table.integer('chip_2')
        table.integer('health')
        table.integer('armour')
        table.integer('life_state')
      })
    }

  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
