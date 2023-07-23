var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

const session = require('express-session');
const cookieParser = require('cookie-parser');
const { default: Axios } = require("axios");

const app = express(); // Instantiate the Express application
app.use(cookieParser());
app.use(
  session({
    secret: 'your-secret-key', // Set a secret key for signing the session cookie
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Ensures the cookie is only accessed through HTTP requests
      maxAge: 24 * 60 * 60 * 1000, // Expiration time for the cookie (in milliseconds)
    },
  })
);


router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: req.body.password,
      country: req.body.country,
      email: req.body.email,
    };
    let users = [];
    users = await DButils.execQuery("SELECT username from users");
    await DButils.execQuery( `COMMIT`);

    if (users.find((x) => x.username === user_details.username))
      throw { status: 409, message: "Username taken" };

    // add the new username
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    await DButils.execQuery(
      `INSERT INTO users (username,firstname,lastname,password,country,email) VALUES ('${user_details.username}', '${user_details.firstname}', '${user_details.lastname}','${hash_password}',
      '${user_details.country}', '${user_details.email}')`
    );
    await DButils.execQuery( `COMMIT`);
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});




router.post("/Login", async (req, res, next) => {
  try {
    // const url = "localhost:8080";
    // const response = await Axios.get(url,{withCredentials: true} );
    // check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    await DButils.execQuery( `COMMIT`);
    if (!users.find((x) => x.username === req.body.username))
      throw { status: 401, message: "Username or Password incorrect" };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];
    await DButils.execQuery( `COMMIT`);

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.username = user.username;
    // Set a cookie on the response
    // res.cookie('session', req.session.user_id, {
    //   maxAge: 24 * 60 * 60 * 1000, // Same as the session cookie expiration time
    //   httpOnly: true,
    // });

    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});



router.post('/Logout', async (req, res, next) => {
  try {
    req.session.destroy(); // Destroy the session
    res.clearCookie('session'); // Clear the session cookie
    res.send({ success: true, message: 'logout succeeded' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;