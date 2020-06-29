const meal_data = require("./data.js");

class fakeDB {
  getTopMeal() {
    let topMeals = [];
    meal_data.forEach((meals) => {
      topMeals.push(
        meals.meal.filter((singleMeal) => {
          return singleMeal.top;
        })
      );
    });
    return topMeals.flat();
  }

  getPackage() {
    return meal_data;
  }
}

module.exports = fakeDB;
