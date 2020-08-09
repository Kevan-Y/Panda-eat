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

function ensureLogin(req, res, next) {
  if (!req.session.user) res.redirect("/login");
  else next();
}

//Meal-package route
router.get("/", (req, res) => {
  db.getMeal()
    .then((data) => {
      res.render("meal-package/mealPackage", {
        title: "Meal Package",
        mealPackage: data.length != 0 ? data : undefined,
        userData: req.session.user,
        userCart:
          req.session.bag == undefined ? undefined : req.session.bag.quantity,
      });
    })
    .catch((err) => {
      console.log(err);
      res.render("meal-package/mealPackage", {
        title: "Meal Package",
        mealPackage: undefined,
        userData: req.session.user,
        userCart:
          req.session.bag == undefined ? undefined : req.session.bag.quantity,
      });
    });
});

//Add meal route
router.get("/add", ensureAdmin, (req, res) => {
  res.render("meal-package/addMealPackage", {
    title: "Add Meal Package",
    userData: req.session.user,
    userCart:
      req.session.bag == undefined ? undefined : req.session.bag.quantity,
  });
});

//meals route
router.get("/meals", ensureAdmin, (req, res) => {
  db.getMeal()
    .then((data) => {
      res.render("meal-package/mealCustom", {
        title: "Meal",
        meal: data.length != 0 ? data : undefined,
        userData: req.session.user,
        userCart:
          req.session.bag == undefined ? undefined : req.session.bag.quantity,
      });
    })
    .catch((err) => {
      console.log(err);
      res.render("meal-package/mealCustom", {
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
        res.render("meal-package/editMeal", {
          title: "Edit Meal Package",
          data: datas,
          userData: req.session.user,
          userCart:
            req.session.bag == undefined ? undefined : req.session.bag.quantity,
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

router.get("/meal", ensureLogin, (req, res) => {
  if (req.query.id) {
    db.getMealbyId(req.query.id).then((datas) => {
      res.render("meal-package/meal", {
        title: datas.name,
        data: datas,
        userData: req.session.user,
        userCart:
          req.session.bag == undefined ? undefined : req.session.bag.quantity,
        script: "mealAdding.js",
        style: "meal",
      });
    });
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
        res.render("meal-package/addMealPackage", {
          title: "Add Meal Package",
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

//Post Add product to cart
router.post("/addProduct", (req, res) => {
  db.getMealbyId(req.body.mealId)
    .then((item) => {
      let index = req.session.bag.cart.findIndex(
        (meal) => meal._id == item._id
      );

      if (index != -1) req.session.bag.cart[index].qty += Number(req.body.qty);
      else {
        item.qty = Number(req.body.qty);
        req.session.bag.cart.push(item);
      }
      console.log(req.session.bag.cart);

      let quantity = 0;
      req.session.bag.cart.forEach((meal) => {
        quantity += meal.qty;
      });

      req.session.bag.quantity = quantity;

      res.json({ data: quantity });
    })
    .catch(() => {
      res.json({ message: "No Items found" });
    });
});

//Post Change Meal cart
router.post("/changeMeal", (req, res) => {
  for (let i = 0; i < req.session.bag.cart.length; i++) {
    if (req.session.bag.cart[i]._id == req.body.mealId) {
      if (req.body.qty == 0) {
        req.session.bag.cart.splice(i, 1);
        break;
      } else {
        req.session.bag.cart[i].qty = Number(req.body.qty);
      }
    }
  }

  let quantity = 0;
  req.session.bag.total = 0;

  req.session.bag.cart.forEach((meal) => {
    quantity += meal.qty;
    req.session.bag.total += meal.price * meal.qty;
  });

  req.session.bag.quantity = quantity;
  res.json({ data: req.session.bag });
});

//Check for error
router.use((err, req, res, next) => {
  if (
    req.headers.referer.split("/")[3] +
      "/" +
      req.headers.referer.split("/")[4] ===
    "meal-package/add"
  )
    res.status(500).render("meal-package/addMealPackage", {
      title: "Add Meal Package",
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
    res.status(500).render("meal-package/edit", {
      title: "Edit Meal Package",
      userData: req.session.user,
      data: req.body,
      errorMessage: "Cannot upload non-image files!",
    });
});

module.exports = router;
