### This is a NodeMailer App

### Technologies Used

- Express: ^4.17.1
- Nodemailer: ^6.4.11
- multiparty: ^4.2.2
- dotenv: ^8.2.0
- Node: 12.14.1

### Usage

1. Install dependencies: `npm install`
2. Add an `.env` file in the root directory with the following variables:
   - `PORT=PORT_YOU_WANT_TO_RUN_APP_ON`
   - `EMAIL=YOUR_EMAIL`
   - `PASS=YOUR_PASSWORD`
   - `TRANSPORTERUSER`
   - `TRANSPORTERPASS`
3. Run server: `npm start`
4. Run server (development): `nodemon`
5. Build header: `npm run watch`
