function makeAJAXRequest(method, url, data) {
  if (data) {
    fetch(url, {
      method: method,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(json => {
        $("span.badge").text(`${json.data}`);
        window.location.pathname = "/meal-package";
      })
      .catch((err) => {
        console.log("Error Fetching");
        alert(err.message);
      });
  } else {
    fetch(url, { method: method })
      .then(res=> res.json())
      .then(json => {
        console.log(json);
      })
      .catch(message => {
        alert(message);
      });
  }
}
function getNum() {
  return $("input.num").val();
}
function addToCart(data) {
  makeAJAXRequest("POST", "/meal-package/addProduct", {
    mealId: data,
    qty: getNum(),
  });
}
