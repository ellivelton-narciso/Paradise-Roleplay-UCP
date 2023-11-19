import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Recovery extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public idUser:number

  @column()
  public code:string

  @column()
  public used: number

  @column()
  public attempt: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public expiresAt: DateTime
}
