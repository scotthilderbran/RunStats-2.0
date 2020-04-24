# RunStats 2.0 Backend

Author: Scott Hilderbran

NodeJS API to power RunStats Client. Server manages PostgreSQL database with user and run information and handles user import from Strava.

## Technologies used

- Bcrypt-nodejs
- Express
- JWT
- Passport
- Sequelize
- PostgreSQL
- Axios
- Strava API

## Public Endpoints

#### /user/register

- _POST_
  - Create a new user
  - Body
    - email : String (**required**)
    - password : String (**required**)
    - userFName: String (**required**)
    - userLName: String (**required**)
    - sex: Boolean (**required**) True to indicate male, false to indicate female
  - Responses
    - 201: User registered - responds with valid JWT
    - 400: Missing fields, fields out of range, or email already in use
    - 500: Internal server error

#### /user/login

- _POST_
  - Login to application
  - Body
    - email : String (**required**)
    - password : String (**required**)
  - Response
    - 200: User logged in, returns valid JWT
    - 400: Missing fields, fields out of range
    - 401: User not found/wrong email password
    - 500: Internal server error

## Private Endpoints (JWT in authorization header)

### User

#### /user/authCheck

- _GET_
  - Verifies current JWT and return refreshed JWT
  - Header
    - Authentication Token (JWT) (**required**)
  - Response
    - 200: Valid JWT returns refreshed JWT
    - 401: Invalid JWT, user session timed out

#### /user/update

- _POST_
  - Updates user profile with specified details
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - email: String (**required**)
    - password: String (**required**)
    - userFName: String (**required**)
    - userLName: String (**required**)
    - sex: Boolean (**required**) True to indicate male, false to indicate female
  - Response
    - 200: User updated
    - 400: Email already in use or age out of range
    - 401: Invalid JWT, unauthorized.
    - 500: Internal server error

#### /user/loadUser

- _GET_
  - Load current user data
  - Header
    - Authentication Token (JWT) (**required**)
  - Response
    - 200: Returns user information
    - 401: Invalid JWT, unauthorized
    - 500: Internal server error

### Run

#### /run/getAllRuns

- _GET_
  - Login to application
  - Header
    - Authentication Token (JWT) (**required**)
  - Response
    - 200: JSON object of all runs
    - 401: Invalid JWT, unauthorized
    - 500: Internal server error

#### /run/addRun

- _POST_
  - Used to add run to database
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - note: String
    - distance: Float (**required**) - distance in mile to 3 decimal places
    - time: Float (**required**) - time in min to 3 decimal places
    - date: String (**required**) - date of run in format "YYYY-MM-DD"
  - Response
    - 201: Run added
    - 400: Distance or time out of range
    - 401: Invalid JWT, unauthorized
    - 500: Internal server error

#### /run/deleteRun

- _POST_
  - Used to delete run from database
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - id: Integer (**required** ) - id of run to remove (used in conjunction with runnerID extracted from JWT in header for enhanced security)
  - Response
    - 200: Run deleted
    - 401: Invalid JWT, unauthorized
    - 500: Internal server error

#### /run/updateRun

- _POST_
  - Used to update run in database
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - id: Integer (**required** ) - id of run to remove (used in conjunction with runnerID extracted from JWT in header for enhanced security)
    - note: String
    - distance: Float (**required**) - distance in mile to 3 decimal places
    - time: Float (**required**) - time in min to 3 decimal places
    - date: String (**required**) - date of run in format "YYYY-MM-DD"
  - Response
    - 200: Run updated
    - 400: Distance or time out of range
    - 401: Invalid JWT, unauthorized
    - 500: Internal server error

### Strava

#### /strava/stravaImport

- _POST_
  - Used to import all of user's Strava activity that is not yet imported
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - code: STRING (**required**) - Strava user authentication code obtained via OAuth. Used to retreive temporary user access token from strava in conjunction with the RunStats client id and client secret
  - Response
    - 200: Strava runs imported
    - 401: Invalid JWT, unauthorized
    - 500: Internal server error

### Analytics

#### /analytic/getTotals

- _GET_
  - Returns percentiles compared to RunStats users and Boston Marathon runners along with user totals
  - Header
    - Authentication Token (JWT) (**required**)
  - Response
    - 200: JSON object of all totals/benchmarks
    - 401: Invalid JWT, unauthorized
    - 500: Internal server error
