const express = require("express");
const router = express.Router();
const fakeDBS = require("../model/fake-data");

//Home route
router.get("/", (req, res) => {
  const fakeDB = new fakeDBS();
  res.render("general/home", {
    title: "Panda Eat",
    topMeal: fakeDB.getTopMeal(),
  });
});

//Register route
router.get("/register", (req, res) => {
  res.render("general/register", {
    title: "Register",
    style: "login",
  });
});

//login route
router.get("/login", (req, res) => {
  res.render("general/login", {
    title: "Login",
    style: "login",
  });
});

//Dashboard route
router.get("/dashboard", (req, res) => {
  res.render("general/dashboard", {
    title: "Dashboard",
    style: "dashboard",
  });
});

//Meal-package route
router.get("/meal-package", (req, res) => {
  const fakeDB = new fakeDBS();
  res.render("general/mealPackge", {
    title: "Meal Package",
    mealPackage: fakeDB.getPackage(),
  });
});

//Post for newsletter
router.post("/submit-form", (req, res) => {
  if (req.body.email_news !== "") {
    console.log(req.body.email_news);
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: `${req.body.email_news}`,
      from: `Kevanew@hotmail.com`,
      subject: "Newsletter Panda Eat",
      html: `<h1>Welcome to Panda Eat</h1><br>
      Dear customer, you have succefully subcribed to Panda Eat. 
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
  } else {
    res.redirect("/");
  }
});

//Post for login
router.post("/login", (req, res) => {
  const error = {};
  const dataLogins = {
    email: req.body.email,
    password: req.body.password,
  };

  if (dataLogins.email == "") error.invalidEmail = "This field is required.";
  else {
    if (!/^\w*[\.\-]*\w*@\w*\.\w*$/.test(dataLogins.email))
      error.invalidEmail = "Please enter a valid email address.";
  }
  if (dataLogins.password == "")
    error.invalidPassword = "This field is required.";

  res.render("general/login", {
    title: "Login",
    style: "login",
    errorMessageLogin: error,
    dataLogin: dataLogins,
  });
});

//Post for Register
router.post("/register", (req, res) => {
  const error = {};

  const dataRegisters = {
    fistName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
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
      subject: "Registration to Panda Eat",
      html: `<h1>Welcome to Panda Eat</h1><br>
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
      style: "login",
      errorMessageRegister: error,
      dataRegister: dataRegisters,
    });
  }
});

module.exports = router;
