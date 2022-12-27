import $ from "jquery";
import { serverAddress } from "./constants";
import { urlLocationHandler } from "./router";
import { validateEmail, validatePassword } from "./validations";
import { openConnection } from './sockets';

const initLogin = (key) => {
  $("#login-button").on("click", async () => {
    const user = {
      email: $("#login-email").val(),
      password: $("#login-password").val(),
    };

    if (validateEmail(user.email) && validatePassword(user.password)) {
      await fetch(serverAddress + "/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: user.email, password: user.password }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.status == 200 ? response.json() : null;
        })
        .then(async (data) => {
          console.log(data);
           if (data != null) {
             key.token = data.token;
             key.userId = data.response.id;
             openConnection($("#login-email").val());
            window.history.pushState({}, "", "/archive");
            await urlLocationHandler();
            }
        });
    } else {
      alert("email or password wrong format!")
    }
  });
};

export { initLogin };
