import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Accounts extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public password: string

  @column()
  public email: string

  @column()
  public ip: string

  @column()
  public character0: number

  @column()
  public character1: number

  @column()
  public character2: number

  @column()
  public vip: number

  @column()
  public viptime: number

  @column()
  public tokentmp: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
