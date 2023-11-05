# Paradise-Roleplay-UCP

<style>
.pink {
color: indianred;
}
.green{
color: greenyellow;
}

</style>

## Endpoints

### <span class="pink">POST</span> <span class="green">/api/login</span>

Faz o login de um usuário e retorna um token de acesso.

**Parametros**
<ul>
<li><b>name:</b> O nome do usuário. (Obrigatório)</li>
<li><b>password:</b> A senha do usuário. (Obrigatório)</li>
</ul>

<b>Corpo da solicitação:</b>

```json
{
  "name": "John",
  "password": "password123"
}
```
<b>Resposta:</b>
```json
{
  "status": 200,
  "user": {
    "userId": 50,
    "name": "John",
    "admin": 0,
    "character": [-1, -1, -1],
    "tokenHash": "e10adc3949ba59abbe56e057f20f883e",
    "expiresAt": "2023-11-08T20:31:40.000Z"
  }
}
```
<b>Erros:</b>
<ul>
<li><b>401:</b> Usuário ou senha inválidos.</li>
</ul>

<b>Observaçoes:</b>
<ul>
<li>O token de acesso tem duração de 3 horas.</li>
</ul>

```curl
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "password": "password123"
  }' \
  http://localhost:5000/api/login

```


### <span class="pink">POST</span> <span class="green">/api/register</span>

Registra um novo usuário.

**Parametros**
<ul>
<li><b>name:</b> O nome do usuário. (Obrigatório)</li>
<li><b>password:</b> A senha do usuário. (Obrigatório)</li>
<li><b>email:</b> O endereço de e-mail do usuário. (Opcional)</li>
<li><b>ip:</b> O endereço IP do usuário. (Opcional)</li>
</ul>
<b>Corpo da solicitação:</b>

```json
{
  "name": "John",
  "password": "password123",
  "email": "johndoe@example.com",
  "ip": "192.168.1.1"
}
```

<b>Resposta:</b>
```json
{
  "status": 201,
  "msg": "Conta criada com sucesso."
}
```

<b>Erros:</b>
<ul>
<li><b>400:</b> Um ou mais campos estão incompletos.</li>
<li><b>403:</b> Este usuário ou e-mail já está cadastrado.</li>
</ul>

<b>Observaçoes:</b>
<ul>
<li>O nome do usuário não pode conter espaços ou caracteres especiais, exceto underline (_) e ponto (.).</li>
</ul>

```curl
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
      "name": "John",
      "password": "password123",
      "email": "johndoe@example.com",
      "ip": "192.168.1.1"
    }' \
  http://localhost:5000/api/register
```

### <span class="pink">GET</span> <span class="green">/api/users</span>

Retorna uma lista de todos os usuários.

<b>Autenticação:</b> Token Bearer

<b>Resposta:</b>
```json
{
  "status": 200,
  "contas": [
    {
      "id": 1,
      "name": "John",
      "email": "johndoe@example.com",
      "admin": 0
    },
    {
      "id": 2,
      "name": "Jane",
      "email": "janedoe@example.com",
      "admin": 1
    }
  ],
  "total": 2
}

```

<b>Erros:</b>
<ul>
<li><b>401:</b> Token Bearer inválido ou usuário não possui permissão para acessar o endpoint.</li>
</ul>

<b>Observaçoes:</b>
<ul>
<li>Este endpoint só pode ser acessado por usuários autenticados com o token Bearer.</li>
<li>O usuário deve ter permissão de administrador para acessar este endpoint.</li>
</ul>

```curl
curl -X GET \
  -H "Authorization: Bearer e10adc3949ba59abbe56e057f20f883e" \
  http://localhost:5000/users

```

### <span class="pink">GET</span> <span class="green">/api/users/:id</span>

Retorna um usuário específico pelo seu ID.

<b>Autenticação:</b> Token Bearer

<b>Parâmetros:</b>
<ul>
<li><b>id:</b> O ID do usuário na URL. (Obrigatório)</li>
</ul>

<b>Corpo da solicitação:</b> Nenhum

<b>Resposta:</b>

```json
{
  "status": 200,
  "data": {
    "name": "John",
    "email": "johndoe@example.com",
    "ip": "192.168.1.1",
    "vip": 1,
    "viptime": 1670407200
  }
}
```

<b>Erros:</b>
<ul>
<li><b>401:</b> Token Bearer inválido ou usuário não possui permissão para acessar o endpoint.</li>
<li><b>404:</b> ID de usuário não encontrado.</li>
</ul>

<b>Observaçoes:</b>
<ul>
<li>Este endpoint só pode ser acessado por usuários autenticados com o token Bearer.</li>
<li>O usuário deve ter permissão de administrador para acessar este endpoint.</li>
</ul>

```curl
curl -X GET \
  -H "Authorization: Bearer e10adc3949ba59abbe56e057f20f883e" \
  http://localhost:5000/users/1
```

### <span class="pink">POST</span> <span class="green">/api/users/:id </span>

Atualiza um usuário específico pelo seu ID.

<b>Autenticação:</b> Token Bearer

<b>Parâmetros:</b>
<ul>
<li><b>id:</b> O ID do usuário na URL. (Obrigatório)</li>
<li><b>name:</b> O nome do usuário. (Obrigatório)</li>
<li><b>password:</b> Nova senha do usuário. (Opcional)</li>
<li><b>email:</b> Novo email do usuário. (Opcional)</li>
</ul>

<b>Corpo da solicitação:</b> 

```json
{
  "name": "John",
  "password": "password123",
  "email": "johndoe@example.com"
}
```
<b>Resposta:</b>
```json
  {
      "status": 200,
      "name": "John",
      "password": "password123",
      "email": "johndoe@example.com",
      "ip": "192.168.1.1",
      "vip": 1,
      "viptime": 1670407200,
      "msg": "Atualizado com sucesso."
  }
```
<b>Erros:</b>
<ul>
<li><b>401:</b> Token Bearer inválido ou usuário não possui permissão para acessar o endpoint.</li>
<li><b>401:</b> Usuário ou email ja cadastrados..</li>
<li><b>404:</b> ID de usuário não encontrado.</li>
<li><b>403:</b> Nome invalido.</li>
</ul>

<b>Observaçoes:</b>
<ul>
<li>Este endpoint só pode ser acessado por usuários autenticados com o token Bearer.</li>
<li>O usuário deve ser o mesmo do ID fornecido na URL para acessar este endpoint.</li>
</ul>

```curl
curl -X POST \
  -H "Authorization: Bearer e10adc3949ba59abbe56e057f20f883e" \
  -d '{
    "name": "John",
    "password": "password123",
    "email": "johndoe@example.com"
  }' \
  http://localhost:5000/users/1
```

### <span class="pink">POST</span> <span class="green">/api/admin/users/:id </span>

Atualiza um usuário específico pelo seu ID, com privilégios de administrador.

### <span class="pink">GET</span> <span class="green">/api/isadmin</span>

Verifica se o usuário atual é administrador.

### <span class="pink">GET</span> <span class="green">/api/isValid</span>

Verifica se o token de acesso do usuário atual é válido.

### <span class="pink">GET</span> <span class="green">/api/characters/:id</span>

Retorna um personagem específico pelo seu ID.

### <span class="pink">POST</span> <span class="green">/api/characters/:id</span>

Atualiza um personagem específico pelo seu ID.

### <span class="pink">POST</span> <span class="green">/api/characters/:id/register</span>

Registra uma nova aplicação para um personagem específico pelo seu ID.

### <span class="pink">POST</span> <span class="green">/api/characters/avaliacao/:id</span>

Atualiza a avaliação de uma aplicação específica pelo seu ID.

### <span class="pink">GET</span> <span class="green">/api/aplicacoes</span>

Retorna uma lista de todas as aplicações.

### <span class="pink">GET</span> <span class="green">/api/aplicacoes/:id</span>

Retorna uma aplicação específica pelo seu ID.

### <span class="pink">GET</span> <span class="green">/api/aplicacoes/user/:id</span>

Retorna uma lista de todas as aplicações registradas para um usuário específico pelo seu ID.

