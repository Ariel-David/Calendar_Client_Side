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
    {name: "Access", id: "eventAccess", type: "select", options:accessibility},
    {name: "Title", id: "title"},
    {name: "Start", id: "start", type: "datetime"},
    {name: "End", id: "end", type: "datetime"},
    {name: "Location", id: "location"},
    {name: "description", id: "Description"},
  ];
  
  const modal = await DayPilot.Modal.form(form, {time:args.start, end:args.end});
  console.log(modal.result.start.toString() + "Z");
  modal.result.start = modal.result.start.toString() + "Z";
  modal.result.end = modal.result.end.toString() + "Z";
  console.log(modal.result);
  dp.clearSelection();
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
      window.history.pushState({}, "", "/archive");
      urlLocationHandler();
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

  const form = [
    {name: "Access", id: "eventAccess", type: "select", options:accessibility},
    {name: "Title", id: "title"},
    {name: "Start", id: "start", type: "datetime"},
    {name: "End", id: "end", type: "datetime"},
    {name: "Location", id: "location"},
    {name: "description", id: "description"},
  ];

  const modal = await DayPilot.Modal.form(form, args.e.data);
  modal.result.start = modal.result.start.toString() + "Z";
  modal.result.end = modal.result.end.toString() + "Z";
  console.log(modal.result);
  if (modal.canceled) {
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

export { initArchive };
