import * as SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { serverAddress } from "./constants";
import {fillCalendar} from "./archive";

let stompClient;
const socketFactory = () => {
  return new SockJS(serverAddress + "/ws");
};

const onMessageReceived = (payload) => {
  alert(payload.body);
  console.log(payload.body);
};

const onUpdateReceived = (payload, key) => {
  console.log("payload: ", payload.body);
  console.log("key: ", key);

  if(payload.body == "Event"){
    fillCalendar(key);
  }
  else{
    console.log("hi");
  }
};

const onConnected = (email,key) => {
  console.log("keyyyyyyyy: ", key);
  console.log("on connected");
  stompClient.subscribe("/notifications/" + email, onMessageReceived);
  stompClient.subscribe("/realTime/" + email, (payload) => {onUpdateReceived(payload, key);});
};

const openConnection = (email,key) => {
  console.log("on open connected");
  const socket = socketFactory();
  stompClient = Stomp.over(socket);
  stompClient.connect({}, () => {onConnected(email,key)});
};

export { openConnection };
