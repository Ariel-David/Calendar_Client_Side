import $ from "jquery";

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {DayPilot} from "@daypilot/daypilot-lite-javascript";

import { serverAddress } from "./constants";

var dp;
const initArchive = async (key) => {
  dp = new DayPilot.Calendar("dp");
  dp.eventDeleteHandling = "Update";
  var nav = new DayPilot.Navigator("nav");
  nav.selectMode = "week";
  nav.onTimeRangeSelected = async function (args) {
    dp.startDate = args.start;
    dp.update();
    fillCalendar(key);
  }
  nav.init();

// view
const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currentDate = `${year}-${month}-${day}`;
console.log(currentDate); // "17-6-2022"
dp.startDate = currentDate;
dp.viewType = "Week";

// event creating
dp.onTimeRangeSelected = async function (args) {

  console.log(args);
  const accessibility = [
    {name: "Private", id: "PRIVATE"},
    {name: "Public", id: "PUBLIC"}
  ];

  const form = [
    {name: "Access", id: "eventAccess", type: "select", options:accessibility, onValidate: validateEventAccess},
    {name: "Title", id: "title", onValidate: validateTitle},
    {name: "Start - if empty takes current day", id: "start", type: "datetime", onValidate: validateDate},
    {name: "End - if empty takes current day", id: "end", type: "datetime", onValidate: validateDate},
    {name: "Location", id: "location"},
    {name: "description", id: "description"},
  ];
  console.log(args.start)
  const modal = await DayPilot.Modal.form(form, {start:args.start, end:args.end});
  dp.clearSelection();
  if (modal.canceled) {
    return;
  }
  console.log(modal.result.start.toString() + "Z");
  modal.result.start = modal.result.start.toString() + "Z";
  modal.result.end = modal.result.end.toString() + "Z";
  console.log(modal.result);
  fetch(serverAddress + "/event/new", {
          method: "POST",
          body: JSON.stringify(modal.result),
          headers: {
            "Content-Type": "application/json",
            token: key.token,
    },
  }).then((response) => {
    if (response.status == 200) {
      console.log("event is ok");
      fillCalendar(key);
    }
  });
};
//show and update
dp.onEventClick = async function (args) {
  console.log(args.e.data)

  const accessibility = [
    {name: "Private", id: "PRIVATE"},
    {name: "Public", id: "PUBLIC"}
  ];
  let usersHtml = await getRoles(args.e.data.id, key)
  
  const form = [
    {name: "Access", id: "eventAccess", type: "select", options:accessibility, onValidate: validateEventAccess},
    {name: "Title", id: "title", onValidate: validateTitle},
    {name: "Start - if empty takes current day", id: "start", type: "datetime", onValidate: validateDate},
    {name: "End - if empty takes current day", id: "end", type: "datetime", onValidate: validateDate},
    {name: "Location", id: "location"},
    {name: "description", id: "description"},
    {name: "users", id: "users", type: "html", html:usersHtml}
  ];

  let originalData = JSON.parse(JSON.stringify(args.e.data));
  const modal = await DayPilot.Modal.form(form, args.e.data);
  if (modal.canceled) {
    return;
  }
  if (modal.result.title == originalData.title) {
    delete modal.result.title;
  }
  if (modal.result.description == originalData.description) {
    delete modal.result.description;
  }
  if (modal.result.eventAccess == originalData.eventAccess) {
    delete modal.result.eventAccess;
  }
  if (modal.result.location == originalData.location) {
    delete modal.result.location;
  }
  if (modal.result.end == originalData.end) {
    delete modal.result.end;
  } else {
    modal.result.end = modal.result.end.toString() + "Z";
  }
  if (modal.result.start == originalData.start) {
    delete modal.result.start;
  } else {
    modal.result.start = modal.result.start.toString() + "Z";
  }
  if (Object.keys(modal.result).length == 2) {
    return;
  }

  fetch(serverAddress + "/event/update?eventId=" + modal.result.id, {
    method: "PUT",
    body: JSON.stringify(modal.result),
    headers: {
      "Content-Type": "application/json",
      token: key.token,
    },
  }).then((response) => {
    console.log("update response: ", response.body)
    if (response.status == 200) {
      fillCalendar(key);
      console.log("deletion success");
    } else {
      alert("update failed!");
      args.preventDefault();
    }
  });
}
//delete
dp.onEventDelete = function (args) {
  fetch(serverAddress + "/event/delete?eventId=" + args.e.data.id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      token: key.token,
    },
  }).then((response) => {
    if (response.status == 200) {
      fillCalendar(key);
      console.log("deletion success");
    } else {
      fillCalendar(key);
      setTimeout(() => {
        alert("cant delete this event!");
      }, 500);
    }
  });
}

dp.init();

await getSharedCalendars(key.token);
fillCalendar(key);

$("#shareCalendarButton").on("click", () => {
  let email = $("#shareCalendarEmailInput").val();
  fetch(serverAddress + "/sharing/share?userEmail=" + email, {
    method: "POST",
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
})
}

const fillCalendar = (key) => {
  dp.events.list = [];
  let route = "/event/getCalendarsBetweenDates?";
  let emails = getCheckedCalendars();
console.log("start:" +dp.visibleStart().toString() + "end: "+dp.visibleEnd().toString());
fetch(serverAddress + route+new URLSearchParams({
  startDate: dp.visibleStart().toString()+"Z",
  endDate: dp.visibleEnd().toString()+"Z",
  usersEmails: emails.join(","),
})
, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    token: key.token,
  },
})
  .then((response) => {
    console.log(response);
    return response.status == 200 ? response.json() : null;
  }).then((events)=>{
    console.log(events.response)
    for(let event of events.response){
      var e = new DayPilot.Event({
      start: new DayPilot.Date(event.start),
      end: new DayPilot.Date(event.end),
      id: event.id,
      title: event.title,
      description:event.description,
      location:event.location,
      eventAccess:event.eventAccess,
      text:event.title
    });
    dp.events.add(e);
    }
  });
}

const validateDate = (args) => {
  console.log(args)
  var value = args.value;
  if (value == null) {
    args.valid = false;
    args.message = "Date required";
  }
}

const validateTitle = (args) => {
  var value = args.value || "";
  if (value.trim().length === 0) {
    args.valid = false;
    args.message = "Text required";
  } 
}

const validateEventAccess = (args) => {
  var value = args.value;
  if (value == null) {
    args.valid = false;
    args.message = "Access required";
  }
}

const getRoles = async (eventId, key) => {
  let usersHtml = `<ul class="list-group" id="active-users">`;
  await fetch(serverAddress + "/event/getUsers?eventId=" + eventId, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token: key.token,
    },
  }).then((response) => {
    return response.status == 200 ? response.json() : null;
  }).then((roles) => {
    console.log("get users response: ", roles)
    for (let index in roles) {
      let role = roles[index];
      const li = document.createElement("li");
      li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
      const trash = document.createElement("img");
      trash.src = "./images/trash.png";
      trash.setAttribute("width", `30px`);
      trash.setAttribute("height", `30px`);
      trash.setAttribute("onclick", `removeUserClicked(${eventId}, "${role.user.email}", "${key.token}")`);
      li.appendChild(trash);
      li.appendChild(document.createTextNode(role.user.email));
      console.log(key.userId);
      if (key.userId == role.user.id) {
        const statusSpan = document.createElement("select");
        statusSpan.setAttribute('id', "userSpan");
        const option1 = document.createElement("option");
        option1.value = "TENTATIVE";
        option1.appendChild(document.createTextNode("TENTATIVE"));
        const option2 = document.createElement("option");
        option2.value = "APPROVED";
        option2.appendChild(document.createTextNode("APPROVED"));
        const option3 = document.createElement("option");
        option3.value = "REJECTED";
        option3.appendChild(document.createTextNode("REJECTED"));
        switch (role.statusType) {
          case "TENTATIVE":
            option1.setAttribute('selected', "selected")
            break;
          case "APPROVED":
            option2.setAttribute('selected', "selected")
            break;
          case "REJECTED":
            option3.setAttribute('selected', "selected")
            break;
          default:
            break;
        }
        statusSpan.appendChild(option1);
        statusSpan.appendChild(option2);
        statusSpan.appendChild(option3);
        statusSpan.setAttribute('onChange', `statusClicked("${key.token}", ${eventId})`)
        statusSpan.classList.add("badge", role.statusType, "status");
        li.appendChild(statusSpan);
      } else {
        const statusSpan = document.createElement("span");
        statusSpan.classList.add("badge", role.statusType);
        statusSpan.appendChild(document.createTextNode(role.statusType));
        li.appendChild(statusSpan);
      }
      
      const span = document.createElement("span");
      span.classList.add("badge", role.roleType);
      span.setAttribute('id', "roleSpan" + role.user.id);
      span.setAttribute("onclick", `userRoleClicked(${eventId}, "${role.user.id}", "${key.token}")`);
      span.appendChild(document.createTextNode(role.roleType));
      li.appendChild(span);
      usersHtml += li.outerHTML;
    }
  });
  usersHtml += `<label for="newGuestEmail">New guest:</label><input id="GuestEmailInput" type="text" id="newGuestEmail" name="newGuestEmail">`;
  const guestButton = document.createElement("button");
  guestButton.appendChild(document.createTextNode("Invite Guest"));
  guestButton.setAttribute("onclick", `inviteGuestClicked(${eventId}, "${key.token}")`);
  usersHtml += guestButton.outerHTML;
  usersHtml += `</ul>`;
  console.log(usersHtml);
  return usersHtml;
}

const removeUser = (eventId, userEmail, myToken) => {
  console.log("removing user");
  fetch(serverAddress + "/event/removeUser?eventId=" + eventId + "&userEmail=" + userEmail, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      token: myToken,
    },
  }).then((response) => {
    console.log("delete role response: ", response.body)
    if (response.status == 200) {
      fillCalendar({token:myToken});
      console.log("deletion role success");
    } else {
      alert("cant delete this role!");
      args.preventDefault();
    }
  });
}

const inviteGuest = (eventId, myToken) => {
  console.log("inviting guest");
  fetch(serverAddress + "/event/new/role?eventId=" + eventId + "&userEmail=" + $("#GuestEmailInput").val(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: myToken,
    },
  }).then((response) => {
    console.log("invite guest response: ", response.body)
    if (response.status == 200) {
      fillCalendar({token:myToken});
      console.log("inviting guess success");
    } else {
      alert("error inviting this user!");
      args.preventDefault();
    }
  });
}

const changeUserRole = (eventId, userId, myToken) => {
  console.log("changing user role");
  fetch(serverAddress + "/event/update/role/type?eventId=" + eventId + "&userId=" + userId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      token: myToken,
    },
  }).then((response) => {
    console.log("change user role response: ", response.body)
    if (response.status == 200) {
      return response.json();
    } else {
      alert("error changing user role for this user!");
      return null;
    }
  }).then((jsonResponse) => {
    $("#roleSpan" + userId).removeClass($("#roleSpan" + userId)[0].innerText);
    $("#roleSpan" + userId).addClass(jsonResponse.response.roleType);
    $("#roleSpan" + userId)[0].innerText = jsonResponse.response.roleType;
    console.log("change user role success");
  });
}

const getSharedCalendars = async (myToken) => {
  console.log("getting shared calendars");
  await fetch(serverAddress + "/sharing/sharedWithMe", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token: myToken,
    },
  }).then((response) => {
    return response.status == 200 ? response.json() : null;
  }).then((users) => {
    $("#sharedCalendarsList").empty();
    for (let index in users.response) {
      const emailChoice = document.createElement("li");
      emailChoice.className = "item";
      const checkBox = document.createElement("input");
      checkBox.type = "checkbox";
      checkBox.name = users.response[index].email;
      checkBox.value = users.response[index].email;
      if (index == users.response.length - 1) {
        checkBox.checked = true;
      }
      checkBox.setAttribute("onchange", `resetCalendar({token:"${myToken}"})`);
      emailChoice.appendChild(checkBox);
      const label = document.createElement("label");
      label.htmlFor = users.response[index].email;
      label.innerText = users.response[index].email;
      emailChoice.appendChild(label);
      $("#sharedCalendarsList").append(emailChoice);
    }
  });
}

const getCheckedCalendars = () => {
  let ul = document.getElementById("sharedCalendarsList");
  let items = ul.getElementsByClassName("item");
  let returnValue = [];
  for (var i =0; i < items.length; i++) {
    let checkBox = items.item(i).getElementsByTagName("input").item(0);
    if (checkBox.checked) {
      returnValue.push(items.item(i).textContent);
    }
  }
  return returnValue;
}

const changeStatus = async (myToken, eventId) => {
  console.log("getting shared calendars");
  console.log($("#userSpan")[0].value);
  await fetch(serverAddress + "/event/update/role/status?eventId=" + eventId + "&status=" + $("#userSpan")[0].value, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      token: myToken,
    },
  }).then((response) => {
    return response.status == 200 ? response.json() : null;
  }).then((role) => {
    $("#userSpan").removeClass("TENTATIVE");
    $("#userSpan").removeClass("APPROVED");
    $("#userSpan").removeClass("REJECTED");
    $("#userSpan").addClass($("#userSpan")[0].value);
  });
}

window.removeUserClicked = removeUser;
window.inviteGuestClicked = inviteGuest;
window.userRoleClicked = changeUserRole;
window.resetCalendar = fillCalendar;
window.statusClicked = changeStatus;
export { initArchive , fillCalendar, getSharedCalendars };
