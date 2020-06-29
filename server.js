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
  });
});

app.post("/submit-form", (req, res) => {
  console.log(req.body.email + " join Panda Feed");
  res.redirect("/");
});

app.post("/login-form", (req, res) => {
  console.log(
    `Login:\n Email: ${req.body.emailInfo}\n Password: ${req.body.passwordInfo}`
  );
  res.redirect("/register");
});

app.post("/register-form", (req, res) => {
  console.log(
    `Register:\n First Name: ${req.body.firstInfo}\n Last Name: ${req.body.lastInfo}\n Email: ${req.body.emailInfo}\n Password: ${req.body.passwordInfo}`
  );
  res.redirect("/register");
});

app.listen(3000, () => console.log("The web server is up and running"));
