import { test } from '@japa/runner'

const base :string  = '/api'
test('display welcome page', async ({ client }) => {
  const response = await client.get(`${base}/`)

  response.assertStatus(200)
  response.assertBodyContains({ hello: 'world' })
})
