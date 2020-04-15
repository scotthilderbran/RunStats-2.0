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

## Private Endpoints (JWT in authorization header)

### User

#### /user/update

- _POST_
  - Updates user profile with specified details
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - email : String (**required**)
    - password : String (**required**)
  - Response
    - Returns status 200 , jwt and user object if successful, status 400 if not

#### /user/loadUser

- _GET_
  - Load current user data
  - Header
    - Authentication Token (JWT) (**required**)
  - Response
    - Returns status 200 , jwt and user object if successful, status 400 if not

### Run

#### /run/getAllRuns

- _GET_
  - Login to application
  - Header
    - Authentication Token (JWT) (**required**)
  - Response
    - Returns status 200 json object of all stored runs

#### /run/addRun

- _POST_
  - Used to add run to database
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - Note - Note to add to run
    - Distance - Distance in miles of run rounded to 3 decimal points
    - Time - Time of run in minutes rounded 3 decimal points
    - Date - Date of run in format "YYYY-MM-DD"
  - Response
    - Returns status 200 json object of all stored runs

#### /run/deleteRun

- _POST_

  - Used to delete run from database
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - id - id of run to remove (used in conjunction with runnerID extracted from JWT in header for enhanced security)
  - Response
    - Returns status 200 json object of all stored runs

#### /run/updateRun

- _POST_
  - Used to update run in database
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - ID - id of run to updated (used in conjunction with runnerID extracted from JWT in header for enhanced security)
    - Note - Note to add to run
    - Distance - Distance in miles of run rounded to 3 decimal points
    - Time - Time of run in minutes rounded 3 decimal points
    - Date - Date of run in format "YYYY-MM-DD"
  - Response
    - Returns status 200 json object of all stored runs

### Strava

#### /strava/stravaTokenExchange

- _POST_
  - Used to import all of user's Strava activity that is not yet imported
  - Header
    - Authentication Token (JWT) (**required**)
  - Body
    - Code - Strava user authentication code obtained via OAuth. Used to retreive temporary user access token from strava in conjunction with the RunStats client id and client secret
  - Response
    - Returns status 200 json object of all stored runs
