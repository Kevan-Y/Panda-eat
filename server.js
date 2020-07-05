const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");

//load environment key and variable
require("dotenv").config({ path: "./config/keys.env" });

const app = express();

//Handlebars middleware
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

//Load controllers
const generalController = require("./controller/general");

//Map controllers
app.use("/", generalController);

app.listen(process.env.PORT, () =>
  console.log("The web server is up and running")
);
