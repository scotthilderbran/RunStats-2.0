# RunStats 2.0 Backend

API to power RunStats 2.0 client

### Public Endpoints

#### /register

- _POST_
  - Create a new user
  - Parameters
    - email : String (**required**)
    - password : String (**required**)
  - Response
    - Returns jwt and user object if successful, status 400 if not

#### /login

- _POST_
  - Login to application
  - Parameters
    - email : String (**required**)
    - password : String (**required**)
  - Response
    - Returns jwt token and user object if successful, status 401 if not
