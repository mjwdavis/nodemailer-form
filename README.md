### This is a NodeMailer App

### Usage

1. Add an `.env` file in the root directory with the following variables:
   - `PORT` - port you want to run the app on
   - `DESTINATIONEMAIL` - where this form is sent
   - `TRANSPORTERUSER` - email of email service we're piggybacking on
   - `TRANSPORTERPASS` - password for the same
   - `EXPRESS_SESSION` - this is just a hash unique to the app for setting Express session
   - `CAS_URL_PROD` - production cas url
   - `CAS_URL_DEV` - dev cas url
   - `APP_URL` - return url for cas

# Development

2. Install dependencies: `npm install`
3. Run server (development): `nodemon`

# Production

2. Install wherever you want it.
3. Start and build app: `docker compose up -d`
