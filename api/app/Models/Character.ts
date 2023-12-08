import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Character extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string


  @column()
  public money: number

  @column()
  public skin: number

  @column()
  public payday: number

  @column()
  public level: number

  @column()
  public xp: number

  @column()
  public job: number

  @column()
  public sex: number

  @column()
  public birthday: string

  @column()
  public posx: number

  @column()
  public posy: number

  @column()
  public posz: number

  @column()
  public posa: number

  @column()
  public interior: number

  @column()
  public interiorvw: number

  @column()
  public house: number

  @column()
  public business: number

  @column()
  public entrance: number

  @column()
  public blocked: number

  @column()
  public hunger: number

  @column()
  public thirst: number

  @column()
  public rg: string

  @column()
  public cpf: string

  @column()
  public cnh: string

  @column()
  public spawn: number
  

  @column()
  public noobchat: number

  @column()
  public sayanim: number
  
  @column()
  public hud: number
  
  @column()
  public velocimetro: number

  @column()
  public fight: number

  @column()
  public faction: number

  @column()
  public leader: number
  
  @column()
  public cargo:string

  @column()
  public phone: number

  @column()
  public chip_1: number

  @column()
  public salary: number
  
  @column()
  public chip_2: number

  @column()
  public health: number

  @column()
  public armour: number

  @column()
  public life_state: number
  
  @column()
  public helmet: number
  
  @column()
  public fishing_box: number
  
  @column()
  public jail: number
  
  @column()
  public jail_time: number
}
