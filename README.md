# RunStats 2.0 Backend

Author: Scott Hilderbran

NodeJS API to power RunStats Client. Server manages PostgreSQL database with user and run information.

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
  - Body
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

#### /user/update

- _POST_
  - Update user profile
  - Body
    - email : String (**required**)
    - password : String (**required**)
  - Response
    - Returns status 200 , jwt and user object if successful, status 400 if not

#### /run/getAllRuns

- _GET_
  - Login to application
  - Parameters
    - user decoded from jwt
  - Response
    - Returns status 200 json object of all stored runs
