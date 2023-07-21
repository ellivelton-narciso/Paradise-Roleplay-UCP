import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Accounts from "App/Models/Accounts";

export default class AccountsController {
    public async login({request, response}: HttpContextContract) {
      const body = request.body()
      const name  =  body.name
      const password = body.password
      const accountExist = await Accounts.findBy('name', name)

      if (!name || !password) {
        response.status(400)
        return {
          status: 400,
          msg: "Um ou mais campos está incompleto!"
        }
      } if(accountExist === null) {
        response.status(401)
          return{
            status: 401,
            msg: "Usuário não existe!"
          }
      } if(accountExist.password !== body.password) {
        response.status(401)
        return{
          status: 401,
          msg: "Senha incorreta!"
        }
      } else {
        response.status(201)
        const jwt = require('jwt-simple');
        const payload = {
          "id": accountExist.id,
          "name": name,
          "email": accountExist.email,
          "creat": String(new Date().getTime())
        };
        const secret = new Date().getSeconds();
        const accountsToken = jwt.encode(payload, String(secret), 'HS256');

        await Accounts.updateOrCreate({
          "id": accountExist.id,
        },{
          tokentmp: accountsToken
        })

        if(!accountExist.createdAt) {
          await Accounts.updateOrCreate({
            "id": accountExist.id,
          },{
            createdAt: accountExist.updatedAt
          })
        }

        return {
          "status": 201,
          "id": accountExist.id,
          "user": accountExist.name,
          "character0": accountExist.character0,
          "character1": accountExist.character1,
          "character2": accountExist.character2,
          "tokentmp": accountsToken,
        }
      }
    }

    public async register({ request, response}: HttpContextContract) {
      const body = request.body()
      const name = body.name
      const password = body.password
      const email = body.email ? body.email : ''
      const ip = body.ip ? body.ip : ''
      const accountExist = await Accounts.findBy('name', name)
      const emailExist = await Accounts.findBy('email', email)

     if(!name || !password) {
       response.status(400)
       return {
         status: 400,
         msg: "Um ou mais campos está incompleto!"
       }
     } if (accountExist !== null || emailExist !== null && email !== ''){
        response.status(400)
        return {
          status: 400,
          msg: "Este usuário ou email já está cadastrado.",
        }
      } else {
       await Accounts.create({
         "name": name,
         "password": password,
         "email": email,
         "ip": ip,
         character0: -1,
         character1: -1,
         character2: -1,
         vip: 0,
         viptime: 0,
         tokentmp: ''
       })
        response.status(201)
       return {
         status: 201,
         msg: "Conta criada com sucesso."
       }
     }
    }

    public async show({params}: HttpContextContract) {
      const accountsExist = await Accounts.findOrFail(params.id)


      return {
        "name": accountsExist.name,
        "password": accountsExist.password,
        "email": accountsExist.email,
        "ip": accountsExist.ip,
      }
    }
}
