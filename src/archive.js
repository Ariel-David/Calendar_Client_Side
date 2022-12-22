import $ from "jquery";

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {DayPilot} from "@daypilot/daypilot-lite-javascript";

import { serverAddress } from "./constants";
import { urlLocationHandler } from "./router";

const initArchive = async (key) => {
  var dp = new DayPilot.Calendar("dp");
  dp.eventDeleteHandling = "Update";
  var nav = new DayPilot.Navigator("nav");
  nav.selectMode = "week";
  nav.onTimeRangeSelected = async function (args) {
    dp.startDate = args.start;
    dp.update();
    fillCalendar(dp, key);
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
      fillCalendar(dp, key);
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

  const modal = await DayPilot.Modal.form(form, args.e.data);
  if (modal.canceled) {
    return;
  }
  modal.result.start = modal.result.start.toString() + "Z";
  modal.result.end = modal.result.end.toString() + "Z";
  console.log(modal.result);
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
      fillCalendar(dp, key);
      console.log("deletion success");
    } else {
      alert("update failed!");
      args.preventDefault();
    }
  });
}
//delete
dp.onEventDelete = function (args) {
  console.log(args.e.data);
  fetch(serverAddress + "/event/delete?eventId=" + args.e.data.id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      token: key.token,
    },
  }).then((response) => {
    console.log("delete response: ", response.body)
    if (response.status == 200) {
      fillCalendar(dp, key);
      console.log("deletion success");
    } else {
      alert("cant delete this event!");
      args.preventDefault();
    }
  });
}

dp.init();

fillCalendar(dp, key);
}

const fillCalendar = (dp, key) => {
  dp.events.list = [];
  let route = "/event/getBetweenDates?";
console.log("start:" +dp.visibleStart().toString() + "end: "+dp.visibleEnd().toString());
fetch(serverAddress + route+new URLSearchParams({
  startDate: dp.visibleStart().toString()+"Z",
  endDate: dp.visibleEnd().toString()+"Z",
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
    console.log(events)
    for(let event of events){
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
      const statusSpan = document.createElement("span");
      statusSpan.classList.add("badge", role.statusType);
      statusSpan.appendChild(document.createTextNode(role.statusType));
      li.appendChild(statusSpan);
      const span = document.createElement("span");
      span.classList.add("badge", role.roleType);
      span.appendChild(document.createTextNode(role.roleType));
      li.appendChild(span);
      usersHtml += li.outerHTML;
    }
  });
  usersHtml += `</ul>`;
  console.log(usersHtml);
  return usersHtml;
}

const removeUser = (eventId, userEmail, token) => {
  console.log("removing user");
  fetch(serverAddress + "/event/removeUser?eventId=" + eventId + "&userEmail=" + userEmail, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      token: token,
    },
  }).then((response) => {
    console.log("delete role response: ", response.body)
    if (response.status == 200) {
      fillCalendar(dp, key);
      console.log("deletion role success");
    } else {
      alert("cant delete this role!");
      args.preventDefault();
    }
  });
}
window.removeUserClicked = removeUser;
export { initArchive };
