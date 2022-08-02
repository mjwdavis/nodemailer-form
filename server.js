const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multiparty = require('multiparty');
var session = require('express-session');
var CASAuthentication = require('node-cas-authentication');
const { body, check, validationResult } = require('express-validator');
// const fileUpload = require('express-fileupload');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

// instantiate an express app
const app = express();
// cors
app.use(cors({ origin: '*' }));

// enable files upload
// app.use(
//   fileUpload({
//     createParentPath: true,
//   })
// );

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

// set cas variables
var cas = new CASAuthentication({
  cas_url: process.env.CAS_URL,
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

// nodemailer setup
const transporter = nodemailer.createTransport({
  host: 'smtp.lib.ucdavis.edu',
  port: 25,
  secure: false,
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

// use this if you want to run it with gmail
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.TRANSPORTERUSER,
//     pass: process.env.TRANSPORTERPASS,
//   },
// });

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

// carrels form

app.get('/carrels', cas.bounce, function (req, res) {
  res.render('carrels', {
    title: 'Shields Carrel Request Form',
  });
});

app.post(
  '/carrels',
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
  check('carrel')
    .isLength({ min: 4 })
    .withMessage('must be at least 4 characters long')
    .isAlphanumeric()
    .withMessage('3 numbers, 1 letter, like: 999X'),
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
        subject: `${
          data.statusfield === 'senate' ||
          data.statusfield === 'emeritus' ||
          data.statusfield === 'federation'
            ? 'Faculty'
            : 'Graduate'
        } Carrel Request - ${data.type} ${
          data.carrel ? `#${data.carrel}` : ''
        }`,
        from: `${data.firstname} ${data.lastname} ${data.email}`,
        sender: `${data.firstname} ${data.email}`,
        to: process.env.DESTINATIONEMAIL, // receiver email,
        text: `A Carrel Request Form was submitted on ${today} by:

      Name: ${data.firstname} ${data.middleinitial} ${data.lastname}
      Email: ${data.email}
      UCD-ID: ${data.ucdid}
      Status: ${data.statusfield}
      Dept.:  ${data.department}
      Phone:  ${data.phone}
      ${
        data.carrel
          ? `RENEWAL of current assignement - Carrel ${data.carrel}`
          : `NEW Application (not currently assigned to a carrel)`
      }
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
          res.status(200).render('carrelssent', {
            mail: mail,
          });
        }
      });
    });
  }
);

// lockers form
app.get('/lockers', cas.bounce, function (req, res) {
  res.render('lockers', {
    title: 'Shields Locker Request Form',
  });
});

app.post(
  '/lockers',
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
  body('phone').unescape().trim(),
  check('phone').isMobilePhone().withMessage('please enter a phone number'),
  body('email').unescape().trim(),
  check('email').isEmail().withMessage('must be email ending in @ucdavis.edu'),
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
        subject: `Locker Request`,
        from: `${data.firstname} ${data.lastname} ${data.email}`,
        sender: `${data.firstname} ${data.email}`,
        to: process.env.DESTINATIONEMAIL, // receiver email lib-lockersandcarrels@ad3.ucdavis.edu
        text: `A Locker Request Form was submitted on ${today} by:

      Name: ${data.firstname} ${data.middleinitial} ${data.lastname}
      Email: ${data.email}
      Phone:  ${data.phone}
      UCD-ID: ${data.ucdid}
      Location: ${data.location}
      Quarter:  ${data.quarter}
      Waitlist:  ${data.waitlist}
      ${data.comments ? `Comments: ${data.comments}` : ''}`,
      };
      transporter.sendMail(mail, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send('Something went wrong.');
        } else {
          res.status(200).render('lockerssent', {
            mail: mail,
            title: 'Locker Request Sent',
          });
        }
      });
    });
  }
);

// lockers form
app.get('/dams-projects', cas.bounce, function (req, res) {
  res.render('dams-projects', {
    title: 'DAMS Projects Request Form',
    // user: req.session[cas.session_name],
  });
});

app.post(
  '/dams-projects',
  // sanitization & validation
  body('champion').unescape().trim(),
  check('champion').isAlpha().withMessage('letters only'),
  body('copyright_other').unescape().trim(),
  check('copyright_other').isAlpha().withMessage('letters only'),
  body('copyright_documentation').unescape().trim(),
  check('copyright_documentation').isAlpha().withMessage('letters only'),
  body('copyright_special').unescape().trim(),
  check('copyright_special').isAlpha().withMessage('letters only'),
  body('important').unescape().trim(),
  check('important').isAlpha().withMessage('letters only'),
  body('digitization_status').unescape().trim(),
  check('digitization_status').isAlpha().withMessage('letters only'),
  body('digitization_link').unescape().trim(),
  check('digitization_link').isAlpha().withMessage('letters only'),
  body('collection_extent').unescape().trim(),
  check('collection_extent').isNumeric().withMessage('numbers only'),
  body('collection_digitized').unescape().trim(),
  check('collection_digitized').isAlpha().withMessage('letters only'),
  body('metadata').unescape().trim(),
  check('metadata').isAlpha().withMessage('letters only'),
  body('metadata_findingaid').unescape().trim(),
  check('metadata_findingaid').isURL().withMessage('URL only'),
  body('metadata_marc').unescape().trim(),
  check('metadata_marc').isURL().withMessage('URL only'),
  body('metadata_ia').unescape().trim(),
  check('metadata_ia').isURL().withMessage('URL only'),
  body('stakeholders_faculty').unescape().trim(),
  check('stakeholders_faculty').isAlpha().withMessage('letters only'),
  body('stakeholders_other').unescape().trim(),
  check('stakeholders_other').isAlpha().withMessage('letters only'),
  body('related').unescape().trim(),
  check('related').isAlpha().withMessage('letters only'),
  body('notes').unescape().trim(),
  check('notes').isAlpha().withMessage('letters only'),

  (req, res) => {
    let form = new multiparty.Form();
    const user = req.session[cas.session_name];
    // const user = 'mjwarren@ucdavis.edu';
    const today = new Date();
    let data = {};
    form.parse(req, function (err, fields) {
      console.log(err);
      Object.keys(fields).forEach(function (property) {
        data[property] = fields[property].toString();
      });
      console.log(data);
      const mail = {
        subject: `New DAMS Potential Project for GitLab`,
        from: `${user}@ucdavis.edu`,
        sender: `${user}@ucdavis.edu`,
        to: process.env.DAMSEMAIL, // receiver email eanebeker@ucdavis.edu
        text: `# Champion  
        ${data.champion}  
        
        # Copyright  

        ${(data.copyright = 'other' ? data.copyright_other : data.copyright)}
        
        ## Supporting Documentation  
        ${data.copyright_documentation}  
        
        ## Special Copyright Considerations
        ${data.copyright_special}  
        
        # Why is this Important?
        ${data.important}  
        
        # Digitization Status
        ${data.digitization_status}   
        
        ## Digitization Link
        ${data.digitization_link}  
        
        # Collection Extent
        * Number of Items: ${data.collection_extent}   
        * Digitized Formats: ${data.collection_digitized}  
        
        # Metadata
        ${data.metadata}  
        
        ## Finding Aid:
        ${data.metadata_findingaid}  
        
        ## MARC:
        ${data.metadata_marc}  
        
        ## Internet Archive:
        ${data.metadata_ia}  
        
        # Stakeholders
        
        ## UC Davis Faculty
        ${data.stakeholders_faculty}  
        
        ## Others
        ${data.stakeholders_other}  
        
        # Related Collections
        ${data.related}  
        
        # Additional Notes
        ${data.notes}  
        
        # Submitted:
        By ${user} ${today}`,
      };
      transporter.sendMail(mail, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send('Something went wrong.');
        } else {
          res.status(200).render('dams-sent', {
            mail: mail,
            title: 'DAMS Project Request Sent',
          });
        }
      });
    });
  }
);

// lockers form
app.get('/digitalsign', function (req, res) {
  res.render('digitalsign', {
    title: 'Digital Sign Request Form',
  });
});

app.post(
  '/digitalsign',
  // sanitization & validation
  body('organization').unescape().trim(),
  check('organization').isAlpha().withMessage('letters only'),
  body('cname').unescape().trim(),
  check('cname').isAlpha().withMessage('letters only'),
  body('email').unescape().trim(),
  check('email').isEmail().withMessage('must be email ending in @ucdavis.edu'),

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
        subject: `Digital Sign Request`,
        from: `${data.cname} ${data.email}`,
        sender: `${data.cname} ${data.email}`,
        to: process.env.DESTINATIONEMAIL, // receiver email lib-lockersandcarrels@ad3.ucdavis.edu
        text: `A Digital Sign Request Form was submitted on ${today} by:

        Sponsoring Organization: ${data.organization}
      Email: ${data.email}
      Contact Name:  ${data.cname}
      From: ${data.datebegin}
      Through: ${data.dateend}
      Which Library:  ${data.library}
      ${data.comments ? `Comments: ${data.comments}` : ''}`,
      };
      transporter.sendMail(mail, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send('Something went wrong.');
        } else {
          res.status(200).render('lockerssent', {
            mail: mail,
            title: 'Locker Request Sent',
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
  res.render('index', {
    title: 'Shields Library Forms - Home',
  });
});

/*************************************************/
// Express server listening...
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
