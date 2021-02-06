# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

 ```node server.js```
    
To run the tests:

```jest -i```

## **Auth Routes:**

<details>
<summary><b>POST - Register new User </b></summary>

<b>Endpoint:</b> `/auth/register`

Require username, password, firstName, lastName, email:

```json
{
    "username": "new", 
    "password": "password",
    "firstName": "first", 
    "lastName": "last",
    "email": "new@email.com" 
}
```

Return JWT token that can be used to authenticate further requests:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5ldyIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE2MTI1NTg5NTR9.A7WIB61INaQ0G-Vc07W_eeumFBj8u8bKvAHqt1BHVhw"
}
```

Authorization required: None
</details>

<details>
<summary><b>POST - Authenticate Token </b></summary>

<b>Endpoint:</b> `/auth/token`

Require username, password:

```json
{
	"username": "new", 
	"password": "password" 
}
```

Return JWT token that can be used to authenticate further requests:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5ldyIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE2MTI1NTk0NDJ9.vvLX6thNNhI5F1YUvzdI0qSLWtoXFJ3d6xFGdmOzwds"
}
```

Authorization required: None
</details>

<br>

## **Company Routes:**

<details>
<summary><b>GET - List of companies </b></summary>

<b>Endpoint:</b> `/companies/`

Return a list of companies:


```json
{
  "companies":
    [
        {
             "handle": "c1",
             "name": "C1",
             "description": "Desc1",
             "numEmployees": 1,
             "logoUrl": "http://c1.img",
        },
        {
             "handle": "c2",
             "name": "C2",
             "description": "Desc2",
             "numEmployees": 2,
             "logoUrl": "http://c2.img",
        },
        {
             "handle": "c3",
             "name": "C3",
             "description": "Desc3",
             "numEmployees": 3,
             "logoUrl": "http://c3.img",
        }
    ]
}
```
#### Filtering Parameters:
| Name         | Type   | Example | Description                                                     |
|--------------|--------|---------|-----------------------------------------------------------------|
| minEmployees | Number | 2       | Filter to companies that have at least that number of employees |
| maxEmployees | Number | 3       | Filter to companies that have no more that number of employees  |
| Name         | String | C1      | Filter by company name                                          |

Example Request and Response: 

<b>Endpoint:</b> `/companies?minEmployees=3`

```json
{
    companies: [
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
    ]
}
```

Authentication Required: None
</details>

<details>
<summary><b>GET - List of companies by its handle </b></summary>

<b>Endpoint:</b> `/companies/:handle`

Company is { handle, name, description, numEmployees, logoUrl, jobs }

Where jobs is [{ id, title, salary, equity , ...]

```json
{
    "company": {
    "handle": "foster-rice",
    "name": "Foster-Rice",
    "description": "Either relate himself. Source TV data one general. Actually than seat eight.",
    "numEmployees": 901,
    "logoUrl": null,
    "jobs": [
      {
        "id": 15,
        "title": "Scientist, forensic",
        "salary": 50000,
        "equity": "0"
      },
      {
        "id": 20,
        "title": "Tourist information centre manager",
        "salary": 88000,
        "equity": "0"
      },
    ]
  }
}
```

Authorization Required: None

</details>

<details>
<summary><b>POST - Create new company </b></summary>

<b>Endpoint:</b> `/companies/`

Company should be {handle, name, description, numEmployees, logoRul}

```json
{
  "handle": "test",
  "name": "newTest",
  "logoUrl": "http://newtest.img",
  "description": "DescTest",
  "numEmployees": 100
}
```
Return {handle, name, descrition, numEmployees, logoUrl}

```json
{
  "company": {
    "handle": "test",
    "name": "newTest",
    "description": "DescTest",
    "numEmployees": 100,
    "logoUrl": "http://newtest.img"
  }
}
```

Authorization Required: Admin - Use an admin Token.
</details>

<details>
<summary><b>PATCH - Update an existing company </b></summary>

<b>Endpoint:</b> `/companies/:handle`

Patches company data.

Fields can be: { name, description, numEmployees, logoUrl }

<b>Endpoint Example:</b> `/companies/test`
```json
{
  "name": "UpdateTest",
  "logoUrl": "http://newtest.img",
  "description": "Update DescTest",
  "numEmployees": 200
}
```

Return: { handle, name, description, numEmployees, logoUrl }

```json
{
  "company": {
    "handle": "test",
    "name": "UpdateTest",
    "description": "Update DescTest",
    "numEmployees": 200,
    "logoUrl": "http://newtest.img"
  }
}
```

Authorization Required: Admin Token 
</details>

<details>
<summary><b>DELETE - Delete a company </b></summary>

<b>Endpoint:</b> `/companies/:handle`

Return => { deleted: handle }

<b>Endpoint Example:</b> `/companies/test`

```json
{
  "deleted": "test"
}
```

Authorization required: Admin token 
</details>

<br>

## **Users Routes:**

<details>
<summary><b>GET - Get list of all Users </b></summary>

<b>Endpoint:</b> `/users`

Return list of all users

```json
users: [
  {
    "username": "u1",
    "firstName": "U1F",
    "lastName": "U1L",
    "email": "user1@user.com",
    "isAdmin": false,
  },
  {
    "username": "u2",
    "firstName": "U2F",
    "lastName": "U2L",
    "email": "user2@user.com",
    "isAdmin": false,
  },
  {
    "username": "u3",
    "firstName": "U3F",
    "lastName": "U3L",
    "email": "user3@user.com",
    "isAdmin": false,
  },
],
```

Authorization required: Admin token 

</details>
<details>
<summary><b>GET - Get user by its username </b></summary>

<b>Endpoint:</b> `/users/[username]`

Return: { username, firstName, lastName, isAdmin, jobs}

Where jobs is { id, title, companyHandle, companyName, state }

<b>Endpoint Example:</b> `/users/testusername1`

```json
{
  "user": {
    "username": "testusername1",
    "firstName": "Test",
    "lastName": "lastnameTest",
    "email": "test@gmail.com",
    "isAdmin": false,
    "applications": [
        200
    ] 
  }
}
```

Authorization required: Admin or same user-as-:username

</details>
<details>
<summary><b>POST - New user </b></summary>

<b>Endpoint:</b> `/users/`

Add a new user   - Not the registration form - It is only for admin to add new users. 

```json
{
	"username": "u-new",
	"firstName": "First-new",
	"lastName": "Last-newL",
	"password": "password-new",
	"email": "new@email.com",
	"isAdmin": false
}
```

Return newly created users and an authentication token for them:
{ user,: { username, firstName, lastName, email, isAdmin}, token }

```json
{
  "user": {
    "username": "u-new",
    "firstName": "First-new",
    "lastName": "Last-newL",
    "email": "new@email.com",
    "isAdmin": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InUtbmV3IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTYxMjU4MzMwNH0.iCY2u2yPzWilSg1L94hnLpd9M2jEokHO361PJ3sd8C0"
}
```

Authorization required: Admin token 

</details>
<details>
<summary><b>POST - Applied Job </b></summary>

<b>Endpoint:</b> `/users/[username]/jobs/[id]`

<b>Endpoint Example:</b> `/users/testusername/jobs/200`

Return { "applied": jobId}

```json
{
  "applied": 200
}
```

Authorization required: Admin or same-user-as:username

</details>
<details>
<summary><b>PATCH - Update an existing user </b></summary>

<b>Endpoint:</b> `/users/[username]`

Data can Include: { firstName, lastName, password, email }

<b>Endpoint Example:</b> `/users/u-new`
```json
{
	"firstName": "newUpdate",
	"lastName": "another update",
	"email": "update@email.com",
	"isAdmin": true
}
```

Return { username, firsName, lastName, email, isAdmin }

```json
{
  "user": {
    "username": "u-new",
    "firstName": "newUpdate",
    "lastName": "another update",
    "email": "update@email.com",
    "isAdmin": true
  }
}
```

Authorization required: Admin or same-user-as : username

</details>
<details>
<summary><b>DELETE - Delete user </b></summary>

<b>Endpoint:</b> `/users/[username]`

<b>Endpoint Example:</b> `/users/u-new`

Return { delete: username }

```json
{
  "deleted": "u-new"
}
```

Authorization required: Admin or same-user-as:username

</details>

<br>

## **Jobs Routes:**

<details>
<summary><b>GET - List of titles </b></summary>

<b>Endpoint:</b> `/jobs/`

Return { id, title, salary, equity, company, }

```json
{
  "jobs": [
  {
    "id": expect.any(Number),
    "title": "J1",
    "salary": 1,
    "equity": "0.1",
    "companyHandle": "c1",
    "companyName": "C1",
  },
  {
    "id": expect.any(Number),
    "title": "J2",
    "salary": 2,
    "equity": "0.2",
    "companyHandle": "c1",
    "companyName": "C1",
  },
  {
    "id": expect.any(Number),
    "title": "J3",
    "salary": 3,
    "equity": null,
    "companyHandle": "c1",
    "companyName": "C1",
  },
 ]
}
```
Can provide search filters: 
#### Filtering Parameters:
| Name         | Type     | Example | Description                                                                             |
|--------------|----------|---------|-----------------------------------------------------------------------------------------|
| minSalary    | Number   | 2       | Filter to jobs with at least that salary                                                |
| hasEquity    | Boolean  | true    | if true -> filter to jobs that provide a non-zero amount equity. If false, list all jobs|
| title        | String   | C1      | Filter by job Title                                                                     |

<b>Endpoint Example:</b> `/jobs?hasEquity=true`

```json
"jobs": [
  {
    "id": expect.any(Number),
    "title": "J1",
    "salary": 1,
    "equity": "0.1",
    "companyHandle": "c1",
    "companyName": "C1",
  },
  {
    "id": expect.any(Number),
    "title": "J2",
    "salary": 2,
    "equity": "0.2",
    "companyHandle": "c1",
    "companyName": "C1",
  },
]
```

Authorization required: None
</details>

<details>
<summary><b>GET - Get user by its id </b></summary>

<b>Endpoint:</b> `/jobs/[jobId]`

Return { id, title, salary, equity, company }
-> Where company is { handle, name, description, numEmployees, logoUrl}

<b>Endpoint Example:</b> `/jobs/200`

```json
{
  "job": {
    "id": 200,
    "title": "Accommodation manager",
    "salary": 126000,
    "equity": null,
    "company": {
      "handle": "mejia-scott-ryan",
      "name": "Mejia, Scott and Ryan",
      "description": "General traditional late situation discussion dog. Before best up strategy about direction.",
      "numEmployees": null,
      "logoUrl": "/logos/logo4.png"
    }
  }
}
```
Authorization required: none

</details>
<details>
<summary><b>POST - Add a new job </b></summary>

<b>Endpoint:</b> `/jobs/`

Should be { title, salary, equity, companyHandle }

```json
{
	"companyHandle": "foster-rice",
	"title": "J-new",
	"salary": 10,
	"equity": "0.2"
}
```

Return { id, title, salary, equity, companyHandle }

```json
{
  "job": {
    "id": 402,
    "title": "J-new",
    "salary": 10,
    "equity": "0.2",
    "companyHandle": "foster-rice"
  }
}
```

Authorization required: Admin

</details>
<details>
<summary><b>PATCH - Update Job </b></summary>

<b>Endpoint:</b> `/jobs/[jobId]`

Data can include: { title, salary, equity }

<b>Endpoint Example:</b> `/jobs/402`

```json
{
	"title": "J-Update",
	"salary": 1000,
	"equity": "0.5"
}
```

Return { id, title, salary, equity, companyHandle }

```json
{
  "job": {
    "id": 402,
    "title": "J-Update",
    "salary": 1000,
    "equity": "0.5",
    "companyHandle": "foster-rice"
  }
}
```

Authorization required: Admin

</details>
<details>
<summary><b>DELETE - Delete a job </b></summary>

<b>Endpoint:</b> `/jobs/[jobId]`

<b>Endpoint Example:</b> `/jobs/402`

Return { delete: id }

```json
{
  "deleted": 402
}
```

Authorization required: Admin 

</details>
