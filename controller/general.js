const express = require("express");
const router = express.Router();
const fakeDBS = require("../model/fake-data");
const db = require("../model/database");

function ensureLogin(req, res, next) {
  if (!req.session.user) res.redirect("/login");
  else next();
}

//Home route
router.get("/", (req, res) => {
  const fakeDB = new fakeDBS();
  res.render("general/home", {
    title: "Panda Eat",
    topMeal: fakeDB.getTopMeal(),
    userData: req.session.user,
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
router.get("/dashboard", ensureLogin, (req, res) => {
  res.render("general/dashboard", {
    title: "Dashboard",
    style: "dashboard",
    userData: req.session.user,
  });
});

//Meal-package route
router.get("/meal-package", (req, res) => {
  const fakeDB = new fakeDBS();
  res.render("general/mealPackge", {
    title: "Meal Package",
    mealPackage: fakeDB.getPackage(),
    userData: req.session.user,
  });
});

//Log out route
router.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect(`/${req.headers.referer.split("/")[3]}`);
});

//Post for newsletter
router.post("/submit-form", (req, res) => {
  if (req.body.email_news !== "") {
    console.log(req.body.email_news, process.env.SENDGRID_EMAIL);
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: `${req.body.email_news}`,
      from: `${process.env.SENDGRID_EMAIL}`,
      subject: "Newsletter Panda Eat",
      html: `<h1>Welcome to Panda Eat</h1><br>
      Dear customer, you have succefully subcribed to Panda Eat. 
    `,
    };
    sgMail
      .send(msg)
      .then(() => {
        res.redirect(`/${req.headers.referer.split("/")[3]}`);
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  } else {
    res.redirect(`/${req.headers.referer.split("/")[3]}`);
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

  if (Object.keys(error).length != 0) {
    res.render("general/login", {
      title: "Login",
      style: "login",
      errorMessageLogin: error,
      dataLogin: dataLogins,
    });
  } else {
    db.validateUser(dataLogins)
      .then((data) => {
        req.session.user = data;
        res.redirect("/dashboard");
      })
      .catch((err) => {
        console.log(err);
        res.render("general/login", {
          title: "Login",
          style: "login",
          errorLogin: "Invalid email or password!",
          dataLogin: dataLogins,
        });
      });
  }
});

//Post for Register
router.post("/register", (req, res) => {
  const error = {};
  const dataRegisters = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    role: "",
  };

  if (dataRegisters.firstName == "")
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
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
        dataRegisters.password
      )
    )
      error.invalidPassword =
        "Please enter a password minimum 6 characters, at least one uppercase letter, one lowercase letter, one number and one special character (@ $ ! % * ? &)";
  }
  console.log(dataRegisters);
  if (Object.keys(error).length === 0) {
    db.addUser(dataRegisters)
      .then(() => {
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: `${dataRegisters.email}`,
          from: `${process.env.SENDGRID_EMAIL}`,
          subject: "Registration to Panda Eat",
          html: `<h1>Welcome to Panda Eat</h1><br>
          Hi ${dataRegisters.firstName} ${dataRegisters.lastName}, you've actived your customer account.
        `,
        };
        sgMail
          .send(msg)
          .then(() => {
            const data = {
              firstName: dataRegisters.firstName,
              lastName: dataRegisters.lastName,
              email: dataRegisters.email,
            };
            req.session.user = data;
            console.log("Here");
            res.redirect("/dashboard");
          })
          .catch((err) => {
            console.log(`Error: ${err}`);
          });
      })
      .catch((err) => {
        console.log(`Error adding User: ${err}`);
        error.invalidEmail = "Email already used.";
        res.render("general/register", {
          title: "Login",
          style: "login",
          errorMessageRegister: error,
          dataRegister: dataRegisters,
        });
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
