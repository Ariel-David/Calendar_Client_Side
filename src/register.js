import $ from "jquery";
import { validateEmail, validatePassword } from "./validations";
import { serverAddress } from "./constants";
import { Button } from "bootstrap";
import {urlLocationHandler} from "./router";

const initRegister = async (key) => {
  const CLIENT_ID = "2298388bcf5985aa7bcb";

  $("#gitHub-button").on("click",(event) =>{
    window.location.assign("https://github.com/login/oauth/authorize?scope=user:email&client_id=" + CLIENT_ID);
  });
  const urlSearchParams = new URLSearchParams(window.location.search);
  console.log(urlSearchParams);
  const params = Object.fromEntries(urlSearchParams.entries());
  console.log(params.code);
  if (params.code != undefined) {
    fetch(serverAddress + "/auth/gitHub?code=" + params.code, {
      method: "POST",
      body: JSON.stringify(),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      return response.status == 200 ? response.json() : null;
    }).then(async (data) => {
      console.log(data);
       if (data != null) {
        key.token = data.token;
        window.history.pushState({}, "", "/archive");
        await urlLocationHandler();
        }
    });
  }
  
  $(document).on("click", "#register-button", async () => {
    const user = {
      email: $("#register-email").val(),
      password: $("#register-password").val(),
    };

    if (validateEmail(user.email)) {
      if (validatePassword(user.password)) {
        fetch(serverAddress + "/auth/register", {
          method: "POST",
          body: JSON.stringify({ email: user.email, password: user.password }),
          headers: {
            "Content-Type": "application/json",
          },
        }).then((response) => registerAlert(response));
      }
      else {
        document.getElementById("validtion").innerHTML =
          "Password input is not valid!";
      }
    }
    else {
      document.getElementById("validtion").innerHTML =
        "Email input is not valid!";
    }
  });
};

function registerAlert(response) {
  if (response.status == 200) {
    document.getElementById("register-alert").style.color = "green"
    document.getElementById("register-alert").innerHTML =
      "Registration was made successfully";
  } else {
    document.getElementById("register-alert").style.color = "red"
    document.getElementById("register-alert").innerHTML =
      "User is already registered! please log in";
  }
}


export { initRegister };
