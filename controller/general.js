const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const uuid = require("uuid");
const db = require("../model/database");

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    return cb(null, true);
  } else {
    return cb(new Error("Not an image! Please upload an image.", 400), false);
  }
};

const storage = multer.diskStorage({
  destination: "./public/img/",
  filename: (req, file, cb) => {
    cb(null, uuid.v4().toString() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage, fileFilter: imageFilter });

function ensureLogin(req, res, next) {
  if (!req.session.user) res.redirect("/login");
  else next();
}

function ensureAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role != "Admin")
    res.redirect("/dashboard");
  else next();
}

//Home route
router.get("/", (req, res) => {
  db.getTopMeal()
    .then((data) => {
      res.render("general/home", {
        title: "Panda Eat",
        topMeal: data.length != 0 ? data : undefined,
        userData: req.session.user,
      });
    })
    .catch((err) => {
      res.render("general/home", {
        title: "Panda Eat",
        topMeal: undefined,
        userData: req.session.user,
      });
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
  db.getMeal()
    .then((data) => {
      res.render("general/mealPackge", {
        title: "Meal Package",
        mealPackage: data.length != 0 ? data : undefined,
        userData: req.session.user,
      });
    })
    .catch((err) => {
      console.log(err);
      res.render("general/mealPackge", {
        title: "Meal Package",
        mealPackage: undefined,
        userData: req.session.user,
      });
    });
});

//Log out route
router.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect(`/${req.headers.referer.split("/")[3]}`);
});

//Add meal route
router.get("/add-meal", ensureAdmin, (req, res) => {
  res.render("general/addMealPackage", {
    title: "Add Meal Package",
    style: "addMeal",
    userData: req.session.user,
  });
});

router.get("/meal",ensureAdmin, (req, res) => {
  db.getMeal()
    .then((data) => {
      res.render("general/meal", {
        title: "Meal",
        meal: data.length != 0 ? data : undefined,
        userData: req.session.user,
      });
    })
    .catch((err) => {
      console.log(err);
      res.render("general/meal", {
        title: "Meal",
        mealPackage: undefined,
        userData: req.session.user,
      });
    });
});

router.get("/edit",ensureAdmin, (req, res) => {
  if (req.query.id) {
    db.getMealbyId(req.query.id)
      .then((datas) => {
        res.render("general/editMeal", {
          title: "Edit Meal Package",
          data: datas,
          userData: req.session.user,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.get("/delete",ensureAdmin, (req, res) => {
  if (req.query.id) {
    db.deleteMealById(req.query.id)
      .then(() => {
        res.redirect("/meal");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log("No Query");
    res.redirect("/meal");
  }
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

//Post Add meal
router.post("/add-meal", upload.single("image"), (req, res) => {
  req.body.image = req.file.filename;
  db.addMeal(req.body)
    .then(() => {
      res.redirect("/meal");
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.render("general/addMealPackage", {
          title: "Add Meal Package",
          style: "addMeal",
          userData: req.session.user,
          data: req.body,
          errorMessage: "Meal Already exist",
        });
      }
      console.log(err);
    });
});

//Post Edit meal
router.post("/edit-meal", (req, res) => {
  db.editMealById(req.body)
    .then(() => {
      res.redirect("/meal");
    })
    .catch((err) => {
      console.log(err);
    });
});

//Check for error
router.use((err, req, res, next) => {
  if (req.headers.referer.split("/")[3] === "add-meal")
    res.status(500).render("general/addMealPackage", {
      title: "Add Meal Package",
      style: "addMeal",
      userData: req.session.user,
      data: req.body,
      errorMessage: "Cannot upload non-image files!",
    });
  else if (req.headers.referer.split("/")[3] === "edit")
    res.status(500).render("general/edit", {
      title: "Edit Meal Package",
      userData: req.session.user,
      data: req.body,
      errorMessage: "Cannot upload non-image files!",
    });
});

module.exports = router;
