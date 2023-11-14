import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ApiToken from 'App/Models/ApiToken'
import Accounts from 'App/Models/Accounts'
import Log from 'App/Models/Log'

export default class LogsController {

  public async show({response}: HttpContextContract) {
      const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const tokenBody: string = authorization[findAuthorization].split(' ')[1]
      if (tokenBody == undefined) {
          return response.status(401).json({
              status: 401,
              msg: 'Sem permissão ou token está inválido.',
          })
      }
      const user: number | boolean = await ApiToken.findBy('token', tokenBody).then(data => {
          if (data) {
              return data.userId
          } else {
              return false
          }
      })
      const tokenOK: boolean = await Accounts.findBy('id', user).then(res => {
          if (!res) {
              return false
          }
          return res.admin > 1
      })

    if (validHeader && tokenOK) {
      try {
        const logs = await Log.all()

        return response.status(200).json({
          status: 200,
          logs
        })
      } catch (e) {
        return response.status(500).json({
          status: 500,
          msg: 'Erro interno ao acessar database e buscar logs'
        })
      }
    }
    return response.status(401).json({
      status: 401,
      msg: 'Sem autorização'
    })
  }
}
