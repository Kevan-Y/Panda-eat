document.querySelector("#loginOff").addEventListener("click", () => {
  document.querySelector("#signPage").style.display = "none";
  document.querySelector("#loginPage").style.display = "block";
});

document.querySelector("#signOff").addEventListener("click", () => {
  document.querySelector("#loginPage").style.display = "none";
  document.querySelector("#signPage").style.display = "block";
});
