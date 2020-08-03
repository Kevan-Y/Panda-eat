const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const uuid = require("uuid");
const db = require("../model/database");
router.use(express.static("public"));

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

function ensureAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role != "Admin")
    res.redirect("/dashboard");
  else next();
}

//Meal-package route
router.get("/", (req, res) => {
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

//Add meal route
router.get("/add", ensureAdmin, (req, res) => {
  res.render("general/addMealPackage", {
    title: "Add Meal Package",
    userData: req.session.user,
  });
});

router.get("/meals", ensureAdmin, (req, res) => {
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

router.get("/edit", ensureAdmin, (req, res) => {
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

router.get("/delete", ensureAdmin, (req, res) => {
  if (req.query.id) {
    db.deleteMealById(req.query.id)
      .then(() => {
        res.redirect("/meal-package/meals");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log("No Query");
    res.redirect("/meal-package/meals");
  }
});

//Post Add meal
router.post("/add", upload.single("image"), (req, res) => {
  req.body.image = req.file.filename;
  db.addMeal(req.body)
    .then(() => {
      res.redirect("/meal-package/meals");
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
router.post("/edit", (req, res) => {
  db.editMealById(req.body)
    .then(() => {
      res.redirect("/meal-package/meals");
    })
    .catch((err) => {
      console.log(err);
    });
});

//Check for error
router.use((err, req, res, next) => {
  if (
    req.headers.referer.split("/")[3] +
      "/" +
      req.headers.referer.split("/")[4] ===
    "meal-package/add"
  )
    res.status(500).render("general/addMealPackage", {
      title: "Add Meal Package",
      style: "addMeal",
      userData: req.session.user,
      data: req.body,
      errorMessage: "Cannot upload non-image files!",
    });
  else if (
    req.headers.referer.split("/")[3] +
      "/" +
      req.headers.referer.split("/")[4] ===
    "meal-package/edit"
  )
    res.status(500).render("general/edit", {
      title: "Edit Meal Package",
      userData: req.session.user,
      data: req.body,
      errorMessage: "Cannot upload non-image files!",
    });
});

module.exports = router;
