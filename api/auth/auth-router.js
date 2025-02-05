const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const Users = require('../users/users-model');
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../secrets"); // use this secret!
const bcrypt = require('bcryptjs');

router.post("/register", validateRoleName, (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  Users.findBy({username: username}).then((result) => {
    if (result && bcrypt.compareSync(password, result.password)) {
      const token = generateToken(result);
      req.jwtToken = token;
      res.status(200).json(result);
      return;
    } else {
      next({status: 401, message: "invalid credentials"});
    }
  })
  .catch(next);
});
/**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
function generateToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username,
    role: user.role_name,
  };
  const options = {
    expiresIn: '1 day',
  };
    return jwt.sign(payload, JWT_SECRET, options);
}
module.exports = router;
