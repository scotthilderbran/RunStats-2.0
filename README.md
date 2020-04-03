# RunStats 2.0 Backend

API to power RunStats 2.0 client

## Technologies used

- Bcrypt-nodejs
- Express
- JsonWebTokens
- Passport
- Sequelize
- PostgreSQL

### Public Endpoints

### /user/register

- _POST_
  - Create a new user
  - Parameters
    - email : String (**required**)
    - password : String (**required**)
    - userFName: String (**required**)
    - userLName: String (**required**)
    - sex: Boolean (**required**) True to indicate male
  - Response
    - Returns status 200 , jwt and user object if successful, status 400 if not

#### /user/login

- _POST_
  - Login to application
  - Parameters
    - email : String (**required**)
    - password : String (**required**)
  - Response
    - Returns status 200 , jwt and user object if successful, status 400 if not

### Private Endpoints (JWT in authorization header)

#### /run/getAllRuns

- _GET_
  - Login to application
  - Parameters
    - user decoded from jwt
  - Response
    - Returns status 200 json object of all stored runs
