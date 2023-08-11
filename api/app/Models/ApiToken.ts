// app/Models/ApiToken.ts
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import {DateTime} from "luxon";

export default class ApiToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public name: string

  @column()
  public type: string

  @column()
  public token: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public expiresAt: DateTime

}
