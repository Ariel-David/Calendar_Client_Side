import $ from "jquery";

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {DayPilot} from "@daypilot/daypilot-lite-javascript";

import { serverAddress } from "./constants";
import { urlLocationHandler } from "./router";

let directoryId;
let currentFile;

const initArchive = async (key) => {
  var dp = new DayPilot.Calendar("dp");
  dp.eventDeleteHandling = "Update";
  var nav = new DayPilot.Navigator("nav");
  nav.selectMode = "week";
  nav.onTimeRangeSelected = function(args) {
      dp.startDate = args.start;
      // load events
      dp.update();
  };
  nav.init();

// view
dp.startDate = "2021-03-25";
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
    {name: "Start", id: "time", type: "datetime"},
    {name: "End", id: "end", type: "datetime"},
    {name: "Location", id: "location"},
    {name: "description", id: "Description"},
  ];
  
  const modal = await DayPilot.Modal.form(form, {time:args.start, end:args.end});
  console.log(modal.result.time.value);
  var timeStart = new Date(modal.result.time);
  var timeEnd = new Date(modal.result.end);
  modal.result.duration = (timeEnd - timeStart)/ 1000 / 60 / 60
  modal.result.date = modal.result.time.value.substring(0, 10);
  modal.result.time = modal.result.time.value.substring(11) + "+01:00"
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

dp.onEventClick = async function (args) {

  const colors = [
      {name: "Blue", id: "#3c78d8"},
      {name: "Green", id: "#6aa84f"},
      {name: "Yellow", id: "#f1c232"},
      {name: "Red", id: "#cc0000"},
  ];

  const form = [
      {name: "Text", id: "text"},
      {name: "time", id: "time", type: "time"},
      {name: "day", id: "day", type: "date"},
      {name: "Color", id: "barColor", type: "select", options: colors},
  ];

  const modal = await DayPilot.Modal.form(form, args.e.data);

  if (modal.canceled) {
      return;
  }

  dp.events.update(modal.result);

}

dp.init();

let route = "/event/getBetweenDates";
let body = JSON.stringify({})
body = JSON.stringify({email:email})

fetch(serverAddress + route, {
  method: "POST",
  body: body,
  headers: {
    "Content-Type": "application/json",
    token: key.token,
  },
})
  .then((response) => {
    console.log(response);
    return response.status == 200 ? response.json() : null;
  })

var e = new DayPilot.Event({
    start: new DayPilot.Date("2021-03-25T12:00:00"),
    end: new DayPilot.Date("2021-03-25T12:00:00").addHours(3),
    id: DayPilot.guid(),
    text: "Special event"
});
dp.events.add(e);
}

export { initArchive };
