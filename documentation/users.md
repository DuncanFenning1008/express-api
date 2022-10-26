## User Routes

Below are a list of the available routes with example requests and responses

---

#### Create User

```
POST /users/create
```

##### Example request

```
{
  name: 'Mr Test',
  email: 'test@test.com',
  password: 'password123'
}
```

#### Example response

```
{
  status: 'success',
  data: { id: 123, name: 'Mr Test', email: 'test@test.com', password: 'password123' }
}
```

---

#### Delete User

```
DELETE /users/:id
```

#### Example response

```
{
  status: 'success',
  message: 'User 123 has been successfully deleted'
}
```

---

#### Get User

```
GET /users/:email
```

#### Example response

```
{
  status: 'success',
  data: {
      _id: 'userID',
      email: 'test@test.com',
      name: 'Mr Test',
      password: {
        encrypted: 'encryptedPassword',
        iv: 'randomBytes'
      },
      type: 'standard',
      created: {
        date: '2020-04-01T21:03:04.150Z'
      }
    }
  }
```

---

#### Get Users

```
GET /users
```

#### Example response

```
{
  status: 'success',
  data: {
    total: 2,
    users: [{
        _id: '5e601d71f26a124a46263d33',
        email: 'test@test.com',
        name: 'Testy McTest',
        type: 'standard',
        created_at: '2020-04-01T21:03:04.150Z'
      },
      {
        _id: '5e601d71f26a124a46263d44',
        email: 'test-vendor@test.com',
        name: 'Testy McVendor',
        type: 'vendor',
        created_at: '2020-04-01T21:03:04.150Z'
    }]
  }
}
```

---

#### Update Users

```
PUT /users/:id
```

##### Example request

```
{
  id: '123456789',
  name: 'Updated User'
}
```

#### Example response

```
{
  status: 'success',
  message: 'User 123456789 successfully updated',
  data: {
    id: '123456789',
    name: 'Updated User'
  }
}
```
