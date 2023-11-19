import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Compra extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public idConta: number

  @column()
  public uuid: string


  @column()
  public produto: string

  @column()
  public preco: number

  @column()
  public status: string


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
