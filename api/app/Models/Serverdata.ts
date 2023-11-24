import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Serverdata extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public mode: string

  @column()
  public language: string

  @column()
  public locked: number

  @column()
  public whitelist: number

  @column()
  public finances: number

  @column()
  public financesduring: number
}
