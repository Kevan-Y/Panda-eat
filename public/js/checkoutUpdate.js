function makeAJAXRequest(method, url, data) {
  if (data) {
    fetch(url, {
      method: method,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((json) => {
        $("span.badge").text(`${json.data.quantity}`);
        $("span.tempTotal").text(
          `CA${new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
          }).format(json.data.total)}`
        );
        $("span.tax").text(
          `CA${new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
          }).format(json.data.total * 0.13)}`
        );
        $("span.totals").text(
          `CA${new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
          }).format(json.data.total * 1.13)}`
        );

        $("div.meal").empty();
        let htmlstr = "";
        if (json.data.cart.length != 0)
          json.data.cart.forEach((element) => {
            htmlstr += `<div class="row">
        <div class="col-lg-3">
        <img class="img-fluid" src="img/${element.image}" alt="Image for ${element.name}">
        </div>
        <div class="col-lg-5">
        <p class="font-weight-bold"><a href="/meal-package/meal?id=${element._id}">${element.name}</a></p>  
        <p class="desc">${element.description}</p>
        <p>Number of meal: ${element.numOfMeal}</p>
        </div>
        <div class="col-lg-2">
        <input type="number" class="form-control num"  id="${element._id}"min="0" value="${element.qty}" onchange='changeFromCart("${element._id}")'/>
        </div>
        <div class="col-lg-2">CA$${element.price}</div>
        </div>   
        `;
          });
        else htmlstr += `<h4>Your shopping cart is empty</h4>`;
        $("div.meal").html(htmlstr);
        $(".btn-block").attr(
          "onclick",
          `checkoutAJAXRequest("${new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
          }).format(json.data.total * 1.13)}")`
        );
      })
      .catch((err) => {
        alert(err.message);
      });
  } else {
    fetch(url, { method: method })
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
      })
      .catch((message) => {
        alert(message);
      });
  }
}

function getNum(data) {
  return $(`input#${data}`).val();
}

function changeFromCart(data) {
  console.log("Calling add with: " + data);
  makeAJAXRequest("POST", "/meal-package/changeMeal", {
    mealId: data,
    qty: getNum(data),
  });
}

function checkoutAJAXRequest(data) {
  if (Number(data.substring(3)) != 0) {
    fetch("/checkout", { method: "POST" })
      .then((res) => res.json())
      .then((json) => {
        $("div.meal").empty();
        $("span.badge").text(`${json.data.quantity}`);
        $("span.tempTotal").text(
          `CA${new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
          }).format(json.data.total)}`
        );
        $("span.tax").text(
          `CA${new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
          }).format(json.data.total * 0.13)}`
        );
        $("span.totals").text(
          `CA${new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
          }).format(json.data.total * 1.13)}`
        );
        $("div.meal").html(`<h4>Your shopping cart is empty</h4>`);
        $("#successful-checkout").modal("show");
        $(".btn-block").attr(
          "onclick",
          `checkoutAJAXRequest("${new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
          }).format(json.data.total * 1.13)}")`
        );
      })
      .catch((message) => {
        alert(message);
      });
  } else {
    let htmlstr = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                   <strong>Your shopping cart is empty!</strong>
                   <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                   <span aria-hidden="true">&times;</span>
                   </button>
                   </div>`;
    $("div.error").empty();
    $("div.error").html(htmlstr);
  }
}
