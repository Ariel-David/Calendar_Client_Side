import $ from "jquery";
import { serverAddress } from "./constants";

const initnotify = async (key) => {
  fetch(serverAddress + "/notifications/getNotificationsSettings", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token: key.token,
    },
  }).then((response) => {
    return response.status == 200 ? response.json() : null;
  }).then((notificationOfUser) => {
    console.log(notificationOfUser)
        setRadioValue(notificationOfUser);
  });


    $("#clickbtn").on("click", () => {
        let notificationSettings = RadioValue();
        console.log(notificationSettings);
    fetch(serverAddress + "/notifications/settings", {
        method: "POST",
        body: JSON.stringify({
          id:history.state.id,
          eventInvitation: notificationSettings[0],
          userStatusChanged: notificationSettings[1],
          eventDataChanged: notificationSettings[2],
          eventCancel: notificationSettings[3],
          userUninvited: notificationSettings[4],
          upcomingEvent: notificationSettings[5],
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
    let notifyArr = []
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
      notifyArr = [eventInvitation
        ,statusChanged
         ,dataChanged
        ,eventCancelled
         ,unInvited
         ,upcomingEvent];

      console.log(eventInvitation,statusChanged
        ,dataChanged
        ,eventCancelled
        ,unInvited
        ,upcomingEvent);

      return notifyArr;
}

function setRadioValue(notificationOfUser) {
   let groups = document.getElementsByClassName('custom-select');
  let notifyArr = ["eventInvitation"
    ,"userStatusChanged"
     ,"eventDataChanged"
    ,"eventCancel"
     ,"userUninvited"
     ,"upcomingEvent"];

  for(let i = 0; i < groups.length; i++) {
    let g = groups[i].getElementsByTagName('input');
   let type = notifyArr[i];
   let pos = notificationOfUser[notifyArr[i]];
            console.log("notifyArr[i]",type);
            console.log("notificationOfUser[notifyArr[i]]",pos);
            if(pos === 'None'){
              g[0].checked = true;
            }
            else if(pos === 'Email'){
              g[1].checked = true;
            }
            else if(pos === 'Popup'){
              g[2].checked = true;
            }
            else{
              g[3].checked = true;
            }
  }
}


export { initnotify };
