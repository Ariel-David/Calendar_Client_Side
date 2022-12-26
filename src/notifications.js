import $ from "jquery";
import { serverAddress } from "./constants";
import {urlLocationHandler} from "./router";

const initnotify = async (key) => {
    $("#clickbtn").on("click", () => {
        let notificationSettings = RadioValue();
        console.log(notificationSettings);
    fetch(serverAddress + "/notifications/settings", {
        method: "POST",
        body: JSON.stringify({
          id:history.state.id,
          eventInvitation: notificationSettings[0],
          UserStatusChanged: notificationSettings[1],
          EventDataChanged: notificationSettings[2],
          EventCancel: notificationSettings[3],
          UserUninvited: notificationSettings[4],
          UpcomingEvent: notificationSettings[5],
        }),
        headers: {
          "Content-Type": "application/json",
          token: key.token,
        },
      }).then((response) => {
        console.log("delete response: ", response.body)
        if (response.status == 200) {
          console.log("successfully invited user");
        } else {
          alert("cant share calendar with this user!");
        }
      });
    });
}

function RadioValue() {
    document.getElementById("result").innerHTML = "";
    var ele = document.getElementsByTagName('input');
    let eventInvitation;
    let statusChanged;
    let dataChanged;
    let eventCancelled;
    let unInvited;
    let upcomingEvent;
    for(let i = 0; i < ele.length; i++) {
        if(ele[i].type="radio") {
            if(ele[i].checked){
              let nameType = ele[i].name;
                switch(nameType){
                  case "JTP1":
                    eventInvitation = ele[i].value;
                    break;
                  case "JTP2":
                    statusChanged = ele[i].value;
                    break;
                  case "JTP3":
                    dataChanged = ele[i].value;
                    break;
                  case "JTP4":
                    eventCancelled = ele[i].value;
                    break;
                  case "JTP5":
                    unInvited = ele[i].value;
                    break;
                  case "JTP6":
                      upcomingEvent = ele[i].value;
                      break;
                }
             }
        }
      }
      return[eventInvitation,statusChanged
        ,dataChanged
        ,eventCancelled
        ,unInvited
        ,upcomingEvent];
}


export { initnotify };
