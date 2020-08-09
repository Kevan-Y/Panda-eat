// GitHub Link: https://github.com/Pandanoxes/Meal-Dev
// Heroku Link: https://panda-eat.herokuapp.com/
// Admin credential:
//        Email: kevanew@hotmail.com
//        Password: Yang2001** (Don't worry this password I don't used in real life)
// Normal User credential:
//        Email: kevinxxlvp@live.fr
//        Password: Yang2001** (Don't worry this password I don't used in real life)
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const clientSessions = require("client-sessions");
const db = require("./model/database");

//load environment key and variable
require("dotenv").config({ path: "./config/keys.env" });

const app = express();

//Handlebars middleware
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup client-sessions
app.use(
  clientSessions({
    cookieName: "session",
    secret: "panda_eat_web322",
    duration: 10 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

//Load controllers
const generalController = require("./controller/general");
const mealController = require("./controller/meal-package");

//Map controllers
app.use("/", generalController);
app.use("/meal-package", mealController);

db.initialize()
  .then(() => {
    console.log("Data read successfully");
    app.listen(process.env.PORT, () =>
      console.log(
        `The web server is up and running on PORT ${process.env.PORT}`
      )
    );
  })
  .catch((data) => {
    console.log(data);
  });
