import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class BankAccounts extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public owner: string

  @column()
  public password: string

  @column()
  public agency: string

  @column()
  public account: string

  @column()
  public balance: number
}
