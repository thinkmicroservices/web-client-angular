import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api-service.service';
import { Router } from '@angular/router';
import { Location } from "@angular/common";


@Injectable({
  providedIn: 'root'
})
export class PeerSignalingService { // rename to PeerSignalingService

  private CONNECTED = true;
  private DISCONNECTED = false;

  private signalingConnectionRetryCounter: number = 0;
 private accountId:string;


  // websocket connection
  private signalingConnection;

  // last known signaling connection state
  private lastSignalingConnectionStatus: PeerSignalingConnectionStatus;

  // get last known signaling connection state
  getLastSignalingConnectionStatus(): PeerSignalingConnectionStatus {
    return this.lastSignalingConnectionStatus;
  }




  constructor(private router: Router,
    private location: Location,
    private apiService: ApiService) {
    // manually send the CONNECTING State
    this.notifyConnectionStatusChange(PeerSignalingConnectionStatus.CONNECTING);
    // register a local peer signaling message handler
    this.registerPeerSignalingMessageListener(this.handlePeerSignalingMessage.bind(this));
  }


  // -----------
  // callback listeners
  // array of signaling connection callbacks
  private signalingConnectionListeners = [];

  // register a callback for signaling connection status changes
  registerConnectionStatusCallback(callback) {
    this.signalingConnectionListeners.push(callback);
  }

  // notify signaling connection status listener when the 
  // status changes.
  notifyConnectionStatusChange(status: PeerSignalingConnectionStatus): void {
    // debounce the status
    if (this.lastSignalingConnectionStatus != status) {

      this.lastSignalingConnectionStatus = status;

      this.signalingConnectionListeners.forEach(function (callback) {
        callback(status)
      })
    }
  }

  // -----------
  // array of users available connection callbacks
  private availableUsersChangeListener = [];

  // register available users change
  registerAvailableUsersChange(callback) {
    this.availableUsersChangeListener.push(callback);
  }

  notifyAvailableUsersChange(availableUsers): void {
    this.availableUsersChangeListener.forEach(function (callback) {
      callback(availableUsers)
    })
  }
  // -----------

  // register signaling message listeners
  private peerSignalingMessageListeners = [];
  // register signaling message listeners
  registerPeerSignalingMessageListener(callback) {
    this.peerSignalingMessageListeners.push(callback);
  }
  // notify new signaling message
  notifyPeerSignalingMessageListeners(message) {
    this.peerSignalingMessageListeners.forEach(function (callback) {
      callback(message)
    });
  }

  // initiate a connection to the signaling service

   connect(jwtToken,accountId) {

    this.accountId=accountId;
    // guard against reconnection when already connected
    if ((this.signalingConnection != null) &&
      ((this.signalingConnection.readyState === WebSocket.CONNECTING) || (this.signalingConnection.readyState == WebSocket.OPEN))
    ) {
      // already connected
      return;
    }

    var self = this;

    console.log("webrtc connect called")
    this.notifyConnectionStatusChange(PeerSignalingConnectionStatus.CONNECTING);

    // create connection
    this.signalingConnection = new WebSocket(this.apiService.getSignalingService(),
    ["authorization",jwtToken ] );
 

    // connection has been opened
    this.signalingConnection.onopen = this.onSignalingConnectionOpen.bind(this);

    // an error occured
    this.signalingConnection.onerror = this.onSignalingConnectionError.bind(this);
    // the connection has closed
    this.signalingConnection.onclose = this.onSignalingConnectionClose.bind(this);

    // handle RX (incoming) signaling message
    this.signalingConnection.onmessage = this.handleRXSignalingMessage.bind(this);

  }


  // handle signalingConnection open
  onSignalingConnectionOpen(event) {

    console.log("on connection ", event)
    this.notifyConnectionStatusChange(PeerSignalingConnectionStatus.CONNECTED);
    this.registerUser(this.getAccountId(), this.getDisplayName());

  }

  // handle signaling connection close
  onSignalingConnectionClose(event) {

    this.notifyConnectionStatusChange(PeerSignalingConnectionStatus.DISCONNECTED);
    console.log("close event", event);
  }

  // handle signaling connection error
  onSignalingConnectionError(err) {

    this.notifyConnectionStatusChange(PeerSignalingConnectionStatus.ERROR);
    console.error("signaling connection error:", err);
    this.signalingConnectionRetry();
  }

  // disconnect from the signaling server
  signalingConnectionDisconnect() {

    if ((this.signalingConnection != null) && (this.signalingConnection.readyState === WebSocket.OPEN)) {
      console.log("rsignalingConnection.readyState", this.signalingConnection.readyState);
      this.signalingConnection.close();
      console.log("Closed signaling connection.")
    } else {
      console.log("Signaling connection already closed.");
    }
  }

  // handle connection retry
  signalingConnectionRetry() {

    if (this.signalingConnectionRetryCounter < 5) {
      // progressive retry
      console.log("signaling connection retry:", this.signalingConnectionRetryCounter++);
      setTimeout(this.connect.bind(this), this.signalingConnectionRetryCounter * 2000);


    } else {
      // give up and set state to disconnected
      this.signalingConnectionRetryCounter = 1;

    }
  }


  // handle rx signaling message
  handleRXSignalingMessage(rawMessage) {
    console.log("RX signaling message", rawMessage.data);

    try {
      var content: any = JSON.parse(rawMessage.data);


      // the peer-signaling service does not allow multiple users
      // to be registered on multiple devices. If a user attempts to
      // register with the Peer-Signaling Service using an account id
      // already in use the service will respond with a 
      // 'duplicate-registration' message and terminate the 
      // websocket connection

      if (content['event'] == "duplicate-registration") {
        this.getToastMessageHandler()(
          {
            severity: "error",
            summary: "Duplicate Peer",
            detail: "You are currently logged in on another device. Peer Services will be disabled for this instance. All other services are still available. This message must be manually closed.",
            sticky: true,
            closable: true
          }
        )
      }

      // this is a hack tthat tests if the incoming message
      // is a 'call-request' ensures that the user is on 'video-chat'
      // page if accepted.
      if (content['event'] === "call-request") {

        console.log("CALL REQUEST", content);

        this.confirmationDialogHandler('Call Request from from: ' + content['callerDisplayName'],
          function () {

            console.log(("accept the call"));
            // send the accept response
            this.sendSignalingMessage("call-request-response", content['callerId'], {
              event: "call-request-response",
              accepted: true
            })



            // generate a "call-request-accepted" message

            let msg = JSON.stringify({
              event: "call-request-accepted",
              callerDisplayName: content['callerDisplayName']

            });

            this.notifyPeerSignalingMessageListeners({ data: msg });
            // switch to the 'video call' component

            this.router.navigate(['/video-call']);
          }.bind(this),

          function () {
            console.log(("reject the call"));
            // send the reject response
            this.sendSignalingMessage("call-request-response", content['callerId'], {
              event: "caller-request-response",
              accepted: false
            })

            // generate a "call-request-rejected" message
            let msg = JSON.stringify(
              {
                event: "call-request-accepted",
                callerDisplayName: content['callerDisplayName']

              });

            this.notifyPeerSignalingMessageListeners({ data: msg });
          }.bind(this)

        )
        return;
      }

      // handle the call request cancel message from the caller.
      // this lets the user know the call was canceled before
      // it could be established by the user confirming the request
      if (content['event'] === "call-request-canceled") {
        let data = content['data'];
        // toast the cancel
        this.getToastMessageHandler()({
          severity: "warn",
          summary: "Call Request Canceled",
          detail: "call request from  " + data['callerDisplayName']+"  was canceled. You must manually close this notification.",
          sticky: true

        });
        return;
      }

      this.notifyPeerSignalingMessageListeners(rawMessage);
    } catch (ex) {
      console.error("no peer message event field present", ex);
    }



  }

  // provde a local callback handler for peer signaling message 
  handlePeerSignalingMessage(rawMessage) {
    console.log("handlePeerSignalingMessage", rawMessage);
    var content: any = JSON.parse(rawMessage.data);
    console.log("content", content);

    var data: any = content.data;

    if (data !== 'success') {
      // inject the caller into the data 

      if (data == null) { data = {} }
      data.caller = content.caller;


    }
    console.log("data from signaling", data)

    switch (content['event']) {




      case "active-user-list":
        console.log("rx active user list", data);
        this.notifyAvailableUsersChange(data);
        break




      default:

    }

  }


  // register the user with the signaling service
  registerUser(accountId: string, email: string) {

    var event = { id: accountId, displayName: email };
    console.log("register", event)

    this.sendSignalingMessage("register-user", accountId, event)

  }


  // request current registered users
  getActiveUsers() {
    this.sendSignalingMessage("get-active-users", this.getAccountId(), {});
  }

  // send raw signaling message 
  sendRawSignalingMessage(message) {
    this.signalingConnection.send(JSON.stringify(message));
  }

  // send signaling message

  sendSignalingMessage(type: string, destinationSessionId: string, event) {
    console.log("sendEvent", type, destinationSessionId, event);
    this.signalingConnection.send("event-" + type + "|" + destinationSessionId + "|" + JSON.stringify(event));
  }


  // retrieve the account id for the authenticated user from sesion storage
  getAccountId(): string {
    return sessionStorage.getItem("accountID");
  }

  // retrieve the display name for the authenticated user from sesion storage
  getDisplayName(): string {
    return sessionStorage.getItem("displayName");
  }


  // set the primeng confirmation dialog handler function
  confirmationDialogHandler: any = null;

  setConfirmationDialogHandler(handler) {
    this.confirmationDialogHandler = handler;
  }
  getConfirmationDialogHandler(): any {
    return this.confirmationDialogHandler;
  }

  // programatically close the confirmationDialog
  // set the primeng toast/message handler function

  toastMessageHandler: any = null;
  setToastMessageHandler(handler) {
    this.toastMessageHandler = handler;
  }
  getToastMessageHandler() {
    return this.toastMessageHandler;
  }

}

export enum PeerSignalingConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR
}


