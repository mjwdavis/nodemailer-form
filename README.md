### This is a NodeMailer App

### Usage

1. Install dependencies: `npm install`
2. Add an `.env` file in the root directory with the following variables:
   - `PORT` - port you want to run the app on
   - `DESTINATIONEMAIL` - where this form is sent
   - `TRANSPORTERUSER` - email of email service we're piggybacking on
   - `TRANSPORTERPASS` - password for the same
   - `EXPRESS_SESSION` - this is just a hash unique to the app for setting Express session
   - `CAS_URL_PROD` - production cas url
   - `CAS_URL_DEV` - dev cas url
   - `APP_URL` - return url for cas
3. Run server: `npm start`
4. Run server (development): `nodemon`
5. Build header: `npm run watch`
