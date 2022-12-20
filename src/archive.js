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
dp.onTimeRangeSelected = function (args) {
    var name = prompt("New event name:", "Event");
    if (!name) return;
    var e = new DayPilot.Event({
        start: args.start,
        end: args.end,
        id: DayPilot.guid(),
        text: name
    });
    dp.events.add(e);
    dp.clearSelection();
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
      {name: "Start", id: "start", type: "datetime"},
      {name: "End", id: "end", type: "datetime"},
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
