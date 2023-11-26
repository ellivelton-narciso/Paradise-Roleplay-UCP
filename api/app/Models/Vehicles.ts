import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Vehicles extends BaseModel {
  @column({ isPrimary: true })
  public id: number

 @column()
  public owner: string
  
  @column()
  public model:number
}
