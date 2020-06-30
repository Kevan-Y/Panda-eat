let bar = document.querySelector("#bar");
bar.addEventListener("click", () => {
  if (document.querySelector(".main-nav").style.display === "block")
    document.querySelector(".main-nav").style.display = "none";
  else {
    document.querySelector(".main-nav").style.display = "block";
  }
});
