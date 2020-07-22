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

let Users;

module.exports.initialize = function () {
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
      resolve();
    });
  });
};

module.exports.addUser = function (data) {
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
