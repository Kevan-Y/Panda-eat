const express = require("express");
const exphbs = require("express-handlebars");
const fakeDBS = require("./model/fake-data");
const app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(express.urlencoded());

app.get("/", (req, res) => {
  const fakeDB = new fakeDBS();
  res.render("home", {
    title: "Panda Feed",
    style: "main.css",
    topMeal: fakeDB.getTopMeal(),
  });
});

app.get("/meal-package", (req, res) => {
  const fakeDB = new fakeDBS();

  res.render("mealPackge", {
    title: "Meal Package",
    style: "main.css",
    mealPackage: fakeDB.getPackage(),
  });
});

app.get("/register", (req, res) => {
  res.render("register", {
    title: "Login",
    style: "login.css",
    register: "none",
    login: "block",
  });
});

app.post("/submit-form", (req, res) => {
  console.log(req.body.email + " join Panda Feed");
  res.redirect("/");
});

app.post("/login-form", (req, res) => {
  const error = {};
  const dataLogins = {
    email: req.body.emailInfo,
    password: req.body.passwordInfo,
  };

  //Print into log
  console.log(
    `Login:\n Email: ${req.body.emailInfo}\n Password: ${req.body.passwordInfo}`
  );

  if (req.body.emailInfo == "") error.invalidEmail = "This field is required.";
  else {
    if (!/^\w*@\w*\.\w*$/.test(req.body.emailInfo))
      error.invalidEmail = "Please enter a valid email address.";
  }
  if (req.body.passwordInfo == "")
    error.invalidPassword = "This field is required.";

  res.render("register", {
    title: "Login",
    style: "login.css",
    errorMessageLogin: error,
    register: "none",
    login: "block",
    dataLogin: dataLogins,
  });
});

app.post("/register-form", (req, res) => {
  const error = {};
  const dataRegisters = {
    fistName: req.body.firstInfo,
    lastName: req.body.lastInfo,
    email: req.body.emailInfo,
    password: req.body.passwordInfo,
  };

  console.log(
    `Register:\n First Name: ${req.body.firstInfo}\n Last Name: ${req.body.lastInfo}\n Email: ${req.body.emailInfo}\n Password: ${req.body.passwordInfo}`
  );

  if (req.body.firstInfo == "") error.invalidFirst = "This field is required.";
  if (req.body.lastInfo == "") error.invalidLast = "This field is required.";
  if (req.body.emailInfo == "") error.invalidEmail = "This field is required.";
  else {
    if (!/^\w*@\w*\.\w*$/.test(req.body.emailInfo))
      error.invalidEmail = "Please enter a valid email address.";
  }
  if (req.body.passwordInfo == "")
    error.invalidPassword = "This field is required.";
  else {
    if (!/^[a-zA-Z0-9]{6,12}$/.test(req.body.passwordInfo))
      error.invalidPassword =
        "Please enter a password with between 6-12 characters and must have one letters and numbers only";
  }

  res.render("register", {
    title: "Login",
    style: "login.css",
    errorMessageRegister: error,
    register: "block",
    login: "none",
    dataRegister: dataRegisters,
  });
});

app.listen(3000, () => console.log("The web server is up and running"));
