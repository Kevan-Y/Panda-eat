const meal = [
  {
    packageName: "Japanese Style Package",
    meal: [
      {
        name: "Sushi",
        top: true,
        price: 15.99,
        img: "Sushi.jpg",
      },
      {
        name: "Sashimi",
        top: false,
        price: 24.99,
        img: "Sashimi.jpg",
      },
      {
        name: "Ramen",
        top: false,
        price: 19.99,
        img: "ramen.jpg",
      }, {
        name: "Sukiyaki",
        top: false,
        price: 31.99,
        img: "Sukiyaki.jpg",
      }
    ],
    price: 293.99,
    img: "Japanese_package.jpg",
    category: "Japanese",
    numOfMeal: 10,
    description: "Package of 10 Japanese dishes with 4 varieties of meals.",
    top: true,
  },
  {
    packageName: "French Style Package",
    meal: [
      {
        name: "Croque monsieur",
        top: false,
        price: 8.99,
        img: "Croque_monsieur.jpg",
      },
      {
        name: "Steak french fries",
        top: true,
        price: 11.99,
        img: "Steak_french_fries.jpg",
      },
      {
        name: "Confit chicken",
        top: false,
        price: 14.99,
        img: "Confit_chicken.jpg",
      }
    ],
    price: 60.99,
    img: "French_package.jpg",
    category: "French",
    numOfMeal: 10,
    description: "Package of 10 french dishes with 3 variety of meals.",
    top: false,
  },
  {
    packageName: "Burger package",
    meal: [
      {
        name: "Chesse burger",
        top: false,
        price: 13.99,
        img: "Chesse_burger.jpg",
      },
      {
        name: "Chiken burger",
        top: true,
        price: 12.99,
        img: "chicken_burger.jpg",
      },
    ],
    price: 59.99,
    img: "Burger_package.jpg",
    category: "Burger",
    numOfMeal: 5,
    description: "Package of 5 burgers with 2 variety of burgers.",
    top: false,
  },
  {
    packageName: "Vegetarian package",
    meal: [
      {
        name: "Vegetarian salad",
        top: false,
        price: 9.99,
        img: "salad_vegi.jpg",
      },
      {
        name: "Healthy sandwich",
        top: true,
        price: 7.99,
        img: "healty_sandwich.jpg",
      }, 
      {
        name: "Vegetarian sandwish",
        top: false,
        price: 6.99,
        img: "vegi_sandwich.jpg",
      },
    ],
    price: 50.99,
    img: "Vegetarian_package.jpg",
    category: "Vegetarian",
    numOfMeal: 6,
    description: "Package of 6 meals with 3 varieties of a vegetarian meals.",
    top: false,
  },
];

module.exports = meal;