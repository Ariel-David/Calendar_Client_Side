import * as SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { serverAddress } from "./constants";

let stompClient;
const socketFactory = () => {
  return new SockJS(serverAddress + "/ws");
};

const onMessageReceived = (payload) => {
  //var message = JSON.parse(payload.body);
  alert(payload.body);
  console.log(payload.body);
};

const onConnected = (email) => {
  console.log("on connected");
  stompClient.subscribe("/notifications/" + email, onMessageReceived);
};

const openConnection = (email) => {
  console.log("on open connected");
  const socket = socketFactory();
  stompClient = Stomp.over(socket);
  stompClient.connect({}, () => {onConnected(email)});
};

export { openConnection };
