const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multiparty = require('multiparty');
var session = require('express-session');
var CASAuthentication = require('node-cas-authentication');
const { body, check, validationResult } = require('express-validator');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

// instantiate an express app
const app = express();
// cors
app.use(cors({ origin: '*' }));

// here you set that all templates are located in `/views` directory
app.set('views', __dirname + '/views');

// here you set that you're using `ejs` template engine, and the
// default extension is `ejs`
app.set('view engine', 'ejs');

app.use('/views', express.static(process.cwd() + '/views')); //make public static

// Set up an Express session, which is required for CASAuthentication.
app.use(
  session({
    secret: process.env.EXPRESS_SESSION,
    resave: false,
    saveUninitialized: true,
  })
);

var cas = new CASAuthentication({
  cas_url: process.env.CAS_URL_DEV,
  service_url: process.env.APP_URL,
  // cas_version: '3.0',
  // renew: false,
  // is_dev_mode: false,
  // dev_mode_user: '',
  // dev_mode_info: {},
  // session_name: 'cas_user',
  // session_info: 'cas_userinfo',
  // destroy_session: false,
  // return_to: 'http://localhost:9999',
});

// const transporter = nodemailer.createTransport({
//   host: 'smtp-mail.outlook.com',
//   port: 587,
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.TRANSPORTERUSER,
    pass: process.env.TRANSPORTERPASS,
  },
});

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

app.post(
  '/',
  // sanitization & validation
  body('firstname').unescape().trim(),
  check('firstname').isAlpha().withMessage('letters only'),
  body('middleinitial').unescape().trim(),
  check('middleinitial').isAlpha().withMessage('letters only'),
  body('lastname').unescape().trim(),
  check('lastname').isAlpha().withMessage('letters only'),
  body('ucdid').unescape().trim(),
  check('ucdid')
    .isLength({ min: 9 })
    .withMessage('must be at least 9 characters long')
    .isNumeric()
    .withMessage('numbers only'),
  body('department').unescape().trim(),
  body('phone').unescape().trim(),
  check('phone').isMobilePhone().withMessage('please enter a phone number'),
  body('email').unescape().trim(),
  check('email').isEmail().withMessage('must be email ending in @ucdavis.edu'),
  body('carrel').unescape().trim(),
  check('ucdid')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 characters long')
    .isNumeric()
    .withMessage('numbers only'),
  body('date').unescape().trim(),
  check('date').isDate().withMessage('must be a valid date'),
  body('sharing').unescape().trim(),
  body('comments').unescape().trim(),

  (req, res) => {
    let form = new multiparty.Form();
    const today = new Date();
    let data = {};
    form.parse(req, function (err, fields) {
      Object.keys(fields).forEach(function (property) {
        data[property] = fields[property].toString();
      });
      console.log(data);
      const mail = {
        sender: `${data.firstname} ${data.email}`,
        to: process.env.DESTINATIONEMAIL, // receiver email,
        text: `A Carrel Request Form was submitted on ${today} by:

      Name: ${data.firstname} ${data.middleinitial} ${data.lastname}
      Email: ${data.email}
      UCD-ID: ${data.ucdid}
      Status: ${data.statusfield}
      Dept.:  ${data.department}
      Phone:  ${data.phone}
      ${(data.type = 'renewal'
        ? `RENEWAL of current assignement - Carrel ${data.carrel}`
        : `NEW Application (not currently assigned to a carrel)`)}
      No longer needed on:  ${data.date}
      ${data.sharing ? `Sharing with: ${data.sharing}` : ''}
      ${data.comments ? `Comments: ${data.comments}` : ''}`,
        body: {
          name: `${data.firstname} ${data.middleinitial} ${data.lastname}`,
          email: `${data.email}`,
          ucdid: `${data.ucdid}`,
          status: `${data.statusfield}`,
          dept: `${data.department}`,
          phone: `${data.phone}`,
          type: `${data.type}`,
          carrel: `${data.carrel}`,
          date: `${data.date}`,
          sharing: `${data.sharing}`,
          comments: `${data.comments}`,
        },
      };
      transporter.sendMail(mail, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send('Something went wrong.');
        } else {
          res.status(200).render('sent', {
            mail: mail,
          });
        }
      });
    });
  }
);

// if you want CAS
// app.get('/', cas.bounce, function (req, res) {
// and if you don't
app.get('/', function (req, res) {
  res.render('index');
});

// test route if you want it
// app.get('/test', function (req, res) {
//   var mascots = [
//     { name: 'Sammy', organization: 'DigitalOcean', birth_year: 2012 },
//     { name: 'Tux', organization: 'Linux', birth_year: 1996 },
//     { name: 'Moby Dock', organization: 'Docker', birth_year: 2013 },
//   ];
//   var tagline =
//     'No programming concept is complete without a cute animal mascot.';
//   res.render('test', {
//     mascots: mascots,
//     tagline: tagline,
//   });
// });

/*************************************************/
// Express server listening...
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
