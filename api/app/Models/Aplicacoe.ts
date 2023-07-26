import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Aplicacoes extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public nome: string

  @column()
  public sobrenome: string

  @column()
  public nascimento: string

  @column()
  public origem: string

  @column()
  public sexo: number

  @column()
  public historia: string

  @column()
  public status: number

  @column()
  public mensagem: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
