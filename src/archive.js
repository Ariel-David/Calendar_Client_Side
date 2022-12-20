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

var e = new DayPilot.Event({
    start: new DayPilot.Date("2021-03-25T12:00:00"),
    end: new DayPilot.Date("2021-03-25T12:00:00").addHours(3),
    id: DayPilot.guid(),
    text: "Special event"
});
dp.events.add(e);


// // Get the modal
// var modal = document.getElementById("myModal");
// // Get the button that opens the modal
// var btn = document.getElementById("myBtn");
// // Get the <span> element that closes the modal
// var span = document.getElementsByClassName("close")[0];

// btn.onclick = function() {
//   modal.style.display = "block";
// }
// // When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//   modal.style.display = "none";
// }

// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }

// $("#submit_event").on("click", (event) => {
//   let event_title = $("#event_title").val();
//   let event_time = $("#event_time").val();
//   let event_date = $("#event_date").val();

//   if (event_title.length != 0) {
//     fetch(serverAddress + "/event/new", {
//       method: "POST",
//       body: JSON.stringify({title:event_title,time:event_time+":00+01:00",date:event_date}),
//       headers: {
//         "Content-Type": "application/json",
//         token: key.token,
//       },
//     }).then((response) => {
//       if (response.status == 200) {
//         console.log("event is ok");
//         window.history.pushState({}, "", "/archive");
//         urlLocationHandler();
//       }
//     });
//   }
// });





//   directoryId = history.state.fid;

  // let objs;

//   await fetch(serverAddress + "/doc/roles", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       token: key.token,
//     },
//   })
//     .then((response) => {
//       return response.status == 200 ? response.json() : null;
//     })
//     .then((data) => {
//       objs = data
//     });

// //   let route = "/user/get/root/sub-files"
// //   let body = JSON.stringify({})

// //   if (directoryId != null && history.state.title != null) {
// //     route = "/user/get/sub-files"
// //     body = JSON.stringify({ id: directoryId, name: history.state.title })
// //   }

  // fetch(serverAddress + route, {
  //   method: "POST",
  //   body: body,
  //   headers: {
  //     "Content-Type": "application/json",
  //     token: key.token,
  //   },
  // })
  //   .then((response) => {
  //     return response.status == 200 ? response.json() : null;
  //   })
  //   .then((files) => {
  //     $("#myBtn").on("click", () => {
  //       // window.history.pushState({ id: directoryId }, "", "/create-document");
  //       urlLocationHandler();
  //     });
  
//       if (files != null) {
//         for (const file of files) {
//           console.log(file);
//           currentFile = file;
//           // we check if the given file is document or directory
//           if (isDocument(file)) {
//             $("#content").append(documentHtml(file));

//             /// we add listeners for each button dynamically
//             $(`#edit-${file.id}`).on("click", async () => {
//               const role = findRole(objs, file.docId);

//               if (role != "VIEWER") {
//                 window.history.pushState({ token: key.token, id: file.docId, title: file.name }, "", `/edit`);
//                 urlLocationHandler();
//               }
//               else {
//                 window.history.pushState({ token: key.token, id: file.docId, title: file.name }, "", `/edit-viewer`);
//                 urlLocationHandler();
//               }

//             });
//           } else {
//             $("#content").append(directoryHtml(file));
//             // we add listeners for each button dynamically
//             $(`#open-${file.id}`).on("click", async () => {
//               window.history.pushState({ fid: file.id, title: file.name }, "", `/archive`);
//               urlLocationHandler();
//             });
//           }

//           // we add listeners for each button dynamically
//           $(`#move-${file.id}`).on("click", async () => {
//             console.log(key.token, file.id);
//             displayOptionsToMove(key.token, file.id, file.name);

//            });

//           $(`#delete-${file.id}`).on("click", async () => {

//             fetch(serverAddress + "/user/delete/dir", {
//               method: "POST",
//               body: JSON.stringify({
//                 id: file.id,
//                 fatherId: directoryId,
//                 docId: file.docId,
//                 name: file.name,
//               }),
//               headers: {
//                 "Content-Type": "application/json",
//                 token: key.token,
//               },
//             }).then((response) => {
//               console.log(response.body);
//               window.history.pushState({}, "", "/archive");
//             })
//           });

//         }
//       }
//     });
// };

// const isDocument = (file) => {
//   return file.docId != null ? true : false;
// };

// const displayOptionsToMove = (keyToken, id, title) => {
//   console.log(keyToken, id);

//   fetch(serverAddress + "/user/get/optional/dir", {
//     method: "POST",
//     body: JSON.stringify({ id: id ,name: title }),
//     // mode: "no-cors",
//     headers: {
//       "Content-Type": "application/json",
//       token: keyToken,
//     },
//   })
//     .then((response) => {
//       return response.status == 200 ? response.json() : null;
//     }).then((files) => {
//       if (files!= null && files.length > 0) {
//         $("#content").append(`<div id="option">
//       <b>${title} can move to:</b> </br></br>`)
//         for (let file of files) {
//           $("#content").append(`<button id="move-btn-${file.id}" style="height:40px;width:100px">${file.name}</button> &nbsp;&nbsp;&nbsp;`)
//           console.log("move-btn-before-click");

//           $(document).on("click", `#move-btn-${file.id}`, function () {
//             fetch(serverAddress + "/user/change/dir", {
//               method: "POST",
//               body: JSON.stringify({
//                 id: id,
//                 name: title,
//                 fatherId: file.id,
//               }),
//               headers: {
//                 "Content-Type": "application/json",
//                 token: keyToken,
//               },
//             }).then((response) => {

//               console.log("update dir: " + response.body);
//               window.history.pushState({}, "", "/archive");
//               document.getElementById(`#move-btn-${file.id}`).style.visibility = 'hidden';

//             })
//           });
//         }
//       }


//     });

// };



// const documentHtml = (file) => {
//   return `<div data-id="${file.id}" data-fid="${file.fatherId}" class="col-3">
//             <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-file-earmark-word-fill" viewBox="0 0 16 16">
//               <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.485 6.879l1.036 4.144.997-3.655a.5.5 0 0 1 .964 0l.997 3.655 1.036-4.144a.5.5 0 0 1 .97.242l-1.5 6a.5.5 0 0 1-.967.01L8 9.402l-1.018 3.73a.5.5 0 0 1-.967-.01l-1.5-6a.5.5 0 1 1 .97-.242z"/>
//             </svg>
//             <b>Title</b>: ${file.name} </br>
//             <button id="edit-${file.id}" class="btn btn-success"> Edit </button>
//             <button id="move-${file.id}" class="btn btn-primary"> Move </button>
//             <button id="delete-${file.id}" class="btn btn-danger"> Delete </button>
//         </div>`;
// };

// const directoryHtml = (file) => {
//   return `<div data-id="${file.id}" data-fid="${file.fatherId}" class="col-3">
//             <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-folder" viewBox="0 0 16 16">
//               <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z"/>
//             </svg>
//             <b>Title</b>: ${file.name} </br>
//             <button id="open-${file.id}" class="btn btn-success"> Open </button>
//             <button id="move-${file.id}" class="btn btn-primary"> Move </button>
//             <button id="delete-${file.id}" class="btn btn-danger"> Delete </button>
//         </div>`;
// };

// const findRole = (objs, docId) => {
//   for (let obj of objs) {
//     if (obj.docId == docId) {
//       return obj.role
//     }
//   }
}

export { initArchive };
