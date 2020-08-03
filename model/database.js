const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
mongoose.set("useCreateIndex", true);
let Schema = mongoose.Schema;

let userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
});

let mealSchema = new Schema({
  name: { type: String, unique: true },
  price: Number,
  description: String,
  category: String,
  numOfMeal: Number,
  top: Boolean,
  image: String,
});

let Users;
let Meals;

module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGOBD_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db.on("error", (err) => {
      reject(err);
    });

    db.once("open", () => {
      Users = db.model("Users", userSchema);
      Meals = db.model("Meals", mealSchema);
      resolve();
    });
  });
};

// Users
module.exports.addUser = (data) => {
  return new Promise((resolve, reject) => {
    for (var formEntry in data) {
      if (data[formEntry] == "") data[formEntry] = null;
    }
    let newUser = new Users(data);
    bcrypt
      .genSalt(10)
      .then((salt) => bcrypt.hash(newUser.password, salt))
      .then((hash) => {
        newUser.password = hash;
        newUser.save((err) => {
          if (err) {
            console.log(`There was an error saving the User: ${err}`);
            reject(err);
          } else {
            console.log(`Saved that User: ${data.email}`);
            resolve();
          }
        });
      })
      .catch((err) => {
        console.log(`Hashing Error: ${err}`);
        reject(`Hashing Error.`);
      });
  });
};

module.exports.getUserByEmail = (inEmail) => {
  return new Promise((resolve, reject) => {
    Users.findOne({ email: inEmail })
      .exec()
      .then((returnUser) => {
        if (returnUser) resolve(returnUser.toObject());
        else reject(`No user with: ${inEmail}`);
      })
      .catch((err) => {
        console.log(`Error Retriving User: ${err}`);
        reject(err);
      });
  });
};

module.exports.validateUser = (data) => {
  return new Promise((resolve, reject) => {
    if (data) {
      this.getUserByEmail(data.email)
        .then((retUser) => {
          bcrypt
            .compare(data.password, retUser.password)
            .then((result) => {
              if (result) {
                resolve({
                  firstName: retUser.firstName,
                  lastName: retUser.lastName,
                  email: retUser.email,
                  role: retUser.role,
                });
              } else {
                reject(`Password don't match`);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

// Meal
module.exports.addMeal = (data) => {
  return new Promise((resolve, reject) => {
    data.top ? (data.top = true) : (data.top = false);
    for (var formEntry in data)
      if (data[formEntry] == "") data[formEntry] = null;

    let newMeal = new Meals(data);

    newMeal.save((err) => {
      if (err) {
        console.log(`There was an error saving the Meal: ${err}`);
        reject(err);
      } else {
        console.log(`Saved that Meal: ${data.name}`);
        resolve();
      }
    });
  });
};

module.exports.getTopMeal = () => {
  return new Promise((resolve, reject) => {
    Meals.find({ top: true })
      .exec()
      .then((returnMeal) => {
        if (returnMeal) resolve(returnMeal.map((meal) => meal.toObject()));
        else reject(`No Top Meal.`);
      })
      .catch((err) => {
        console.log(`Error Retriving Meals: ${err}`);
        reject(err);
      });
  });
};
module.exports.getMeal = () => {
  return new Promise((resolve, reject) => {
    Meals.find()
      .exec()
      .then((returnMeal) => {
        if (returnMeal) resolve(returnMeal.map((meal) => meal.toObject()));
        else reject(`No Top Meal.`);
      })
      .catch((err) => {
        console.log(`Error Retriving Meals: ${err}`);
        reject(err);
      });
  });
};

module.exports.getMealbyId = (inId) => {
  return new Promise((resolve, reject) => {
    Meals.findOne({ _id: inId })
      .exec()
      .then((returnMeal) => {
        if (returnMeal) resolve(returnMeal.toObject());
        else reject(`No Top Meal.`);
      })
      .catch((err) => {
        console.log(`Error Retriving Meals: ${err}`);
        reject(err);
      });
  });
};

module.exports.deleteMealById = (inId) => {
  return new Promise((resolve, reject) => {
    Meals.deleteOne({ _id: inId })
      .exec()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports.editMealById = (data) => {
  return new Promise((resolve, reject) => {
    data.top ? (data.top = true) : (data.top = false);
    for (var formEntry in data) {
      if (data[formEntry] == "") data[formEntry] = null;
    }
    Meals.updateOne(
      {
        _id: data._id,
      },
      {
        $set: {
          name: data.name,
          price: data.price,
          description: data.description,
          category: data.category,
          numOfMeal: data.numOfMeal,
          top: data.top,
        },
      }
    )
      .exec()
      .then(() => {
        console.log(`Meal ${data.name} has been updated`);
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};
