const express = require("express");
const router = express.Router();
const fakeDBS = require("../model/fake-data");

//Home route
router.get("/", (req, res) => {
  const fakeDB = new fakeDBS();
  res.render("general/home", {
    title: "Panda Feed",
    style: "main.css",
    topMeal: fakeDB.getTopMeal(),
  });
});

//Register/login route
router.get("/register", (req, res) => {
  res.render("general/register", {
    title: "Login",
    style: "login.css",
    register: "none",
    login: "block",
  });
});

//Dashboard route
router.get("/dashboard", (req, res) => {
  res.render("general/dashboard", {
    title: "Dashboard",
    style: "dashboard.css",
  });
});

//Meal-package route
router.get("/meal-package", (req, res) => {
  const fakeDB = new fakeDBS();
  res.render("general/mealPackge", {
    title: "Meal Package",
    style: "main.css",
    mealPackage: fakeDB.getPackage(),
  });
});

//Post for newsletter
router.post("/submit-form", (req, res) => {
  console.log(req.body.email + " join Panda Feed");
  if (req.body.email != "") {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: `${req.body.email}`,
      from: `Kevanew@hotmail.com`,
      subject: "Newsletter Panda Feed",
      html: `<h1>Welcome to Panda Feed</h1><br>
      Dear customer, you have succefully subcribed to Panda Feed. 
    `,
    };
    sgMail
      .send(msg)
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  }
});

//Post for login
router.post("/login-form", (req, res) => {
  const error = {};
  const dataLogins = {
    email: req.body.emailInfo,
    password: req.body.passwordInfo,
  };

  //Print into log
  console.log(
    `Login:\n Email: ${dataLogins.email}\n Password: ${dataLogins.password}`
  );

  if (dataLogins.email == "") error.invalidEmail = "This field is required.";
  else {
    if (!/^\w*[\.\-]*\w*@\w*\.\w*$/.test(dataLogins.email))
      error.invalidEmail = "Please enter a valid email address.";
  }
  if (dataLogins.password == "")
    error.invalidPassword = "This field is required.";

  res.render("general/register", {
    title: "Login",
    style: "login.css",
    errorMessageLogin: error,
    register: "none",
    login: "block",
    dataLogin: dataLogins,
  });
});

//Post for Register
router.post("/register-form", (req, res) => {
  const error = {};

  const dataRegisters = {
    fistName: req.body.firstInfo,
    lastName: req.body.lastInfo,
    email: req.body.emailInfo,
    password: req.body.passwordInfo,
  };

  if (dataRegisters.fistName == "")
    error.invalidFirst = "This field is required.";
  if (dataRegisters.lastName == "")
    error.invalidLast = "This field is required.";
  if (dataRegisters.email == "") error.invalidEmail = "This field is required.";
  else {
    if (!/^\w*[\.\-]*\w*@\w*\.\w*$/.test(dataRegisters.email))
      error.invalidEmail = "Please enter a valid email address.";
  }

  if (dataRegisters.password == "")
    error.invalidPassword = "This field is required.";
  else {
    if (!/^[a-zA-Z0-9]{6,12}$/.test(dataRegisters.password))
      error.invalidPassword =
        "Please enter a password with between 6-12 characters and must have one letters and numbers only";
  }

  if (Object.keys(error).length === 0) {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: `${dataRegisters.email}`,
      from: `Kevanew@hotmail.com`,
      subject: "Registration to Panda Feed",
      html: `<h1>Welcome to Panda Feed</h1><br>
        Hi ${dataRegisters.fistName} ${dataRegisters.lastName}, you've actived your customer account. 
      `,
    };
    sgMail
      .send(msg)
      .then(() => {
        res.redirect("/dashboard");
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  } else {
    res.render("general/register", {
      title: "Login",
      style: "login.css",
      errorMessageRegister: error,
      register: "block",
      login: "none",
      dataRegister: dataRegisters,
    });
  }
});

module.exports = router;
