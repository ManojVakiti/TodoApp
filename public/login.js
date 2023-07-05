var formDetails = document.getElementById("addUserForm");


formDetails.addEventListener("submit", function(event) {
    console.log("heleloo")
    var usernameEl = document.getElementById("username")
    var passEl = document.getElementById("password")

    var error = document.getElementById("error");
    error.textContent = "";
    let a = usernameEl.value
    let b = passEl.value
    if (a === "" || b === "") {
        event.preventDefault();
        error.textContent = "Please Enter Your Details";
        
    } else if (b.length < 8) {
        event.preventDefault();
        error.textContent = "Password should be atleast 8 characters";
        
    } else {
        error.textContent = "";
    }
})