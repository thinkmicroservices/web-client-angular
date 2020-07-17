import { Component, OnInit } from '@angular/core';
import { AfterViewInit, ViewChild } from '@angular/core';


import { ListboxModule } from 'primeng/listbox';
import { PeerSignalingService, PeerSignalingConnectionStatus } from '../../../services/peer-signaling/peer-signaling.service'
import { SelectItem } from 'primeng/api';

import { VideoPlayerComponent } from "../video-player/video-player.component";


import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { Message } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class VideoCallComponent implements OnInit, AfterViewInit {

  connectionStateLabel: string = "";

  availableUsers: SelectItem[] = [];
  availableUsersDisabled: boolean = true;
  selectedUser: {} = {};

  @ViewChild('localVideo', { static: false }) localVideoPlayer: VideoPlayerComponent;
  @ViewChild('remoteVideo', { static: false }) remoteVideoPlayer: VideoPlayerComponent;

  hideAvailableUserList: boolean = true;
  hideRemoteVideo: boolean = true;
  hideWaitingForCallResponse: boolean = true;

  localVideoCallerId: string = "unassigned";
  remoteVideoCallerId: string = "unassigned";

  calleeName: string = "unknown";
  // handle local RTC peer 

  peerConnection: RTCPeerConnection = null;
  localStream: any;
  cancelCallFlag: boolean = false;

  constructor(
    private peerSignalingService: PeerSignalingService,

  ) {

    this.peerSignalingConnectionStatusChange(peerSignalingService.getLastSignalingConnectionStatus());
    this.peerSignalingService.registerConnectionStatusCallback(this.peerSignalingConnectionStatusChange.bind(this))
    this.peerSignalingService.registerAvailableUsersChange(this.availableUsersChange.bind(this));
    this.peerSignalingService.registerPeerSignalingMessageListener(this.handlePeerSignalingMessage.bind(this));
    this.localVideoCallerId = this.peerSignalingService.getAccountId();
  }

  ngOnInit() {

    this.initializeLocalVideoPlayer(this.localVideoPlayer);
  }

  ngAfterViewInit() {




    // this.remoteVideoPlayer.setTitle("remote");
    console.log('remoteVideoPlayer', this.remoteVideoPlayer);

  }



  // calback method for changes in available users
  availableUsersChange(availableUsersChange): void {
    console.log("available users change", availableUsersChange);
    this.availableUsers = [];

    availableUsersChange.forEach(element => {
      console.log("user=>", element)

      if (element.displayName != this.peerSignalingService.getDisplayName()) {
        var newItem = { label: element.displayName, value: element.id }
        console.log("new item", newItem);


        this.availableUsers.push(newItem)
      }
      this.peerSignalingService.getToastMessageHandler()({ severity: 'success', summary: 'Available Users', detail: 'Available Users Changed' });
    });

    console.log("list", this.availableUsers);
  }

  // callback method for peer signaling connection state changes
  peerSignalingConnectionStatusChange(status: PeerSignalingConnectionStatus) {

    switch (status) {
      case PeerSignalingConnectionStatus.DISCONNECTED: this.setDisconnectedState()
        break;

      case PeerSignalingConnectionStatus.CONNECTING: this.setConnectingState();
        break;

      case PeerSignalingConnectionStatus.CONNECTED: this.setConnectedState();
        break;

      case PeerSignalingConnectionStatus.ERROR: this.setErrorState();
        break;

      default: this.setErrorState();
        break;
    }
  }


  //
  setDisconnectedState() {
    this.connectionStateLabel = "Disconnected.";
    this.availableUsersDisabled = true;
  }

  setConnectingState() {
    this.connectionStateLabel = "Connecting...";
    this.availableUsersDisabled = true;
  }

  setConnectedState() {
    this.connectionStateLabel = "Connected."; this.
      availableUsersDisabled = false;
    this.peerSignalingService.getActiveUsers();
  }

  setErrorState() {
    this.connectionStateLabel = "Connection Error.";
    this.availableUsersDisabled = true;
  }



  userSelected() {
    console.log("selected", this.selectedUser)
    this.callRemotelUser(this.selectedUser);
  }


  // signaling message callback
  handlePeerSignalingMessage(rawMessage) {
    console.log("video call signaling message", rawMessage);
    var content: any = JSON.parse(rawMessage.data);
    console.log("content", content);
    //alert("check console")
    var data: any = content.data;

    if (data !== 'success') {

      if (data == null) { data = {} }
      data.caller = content.caller;

    }
    console.log("data from signaling", data)

    switch (content['event']) {
      // when somebody wants to call us
      case "offer":
        this.handleOffer(data);
        break;
      case "answer":
        this.handleAnswer(data);
        break;
      // when a remote peer sends an ice candidate to us
      case "candidate":
        this.handleCandidate(data);
        break;

      // this is generated by the local peer signaling service
      // when the user accepts the incoming call/ 
      case "call-request-accepted": this.handleCallRequestAccepted(content);
        break;
      case "call-request-rejected": this.handleCallRequestRejected(content);
        break;

       

      case "call-request-response": this.handleCallRequestResponse(content);
        break;





      case "remote-hangup":
        console.log("incoming call request", rawMessage);
        this.handleRemoteHangup(data);
        break

      default:

    }
  }


  // local video stream


  readonly mediaStreamConstraints = {
    video: true,
    audio: true,
    mediaSource: 'screen'
  };

  initializeLocalVideoPlayer(localVideoPlayer) {
    navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
      .then(

        (mediaStream) => {
          console.log("obtained local media stream", mediaStream);
          this.localStream = mediaStream;

          this.localVideoPlayer.setTitle(this.peerSignalingService.getDisplayName());
          this.localVideoPlayer.setMediaStream(mediaStream);


          this.initializeRTCPeer();
        }
      ).catch((error) => {
        console.error('navigator.getUserMedia error: ', error);
      });
  }







  initializeRTCPeer() {

    console.log("initializing");

    var stunConfiguration = new VideoCallRTCConfiguration();
    /** 
    var stunConfiguration: any = {
      'iceServers': [{
        'url': 'stun:stun.stunprotocol.org:3478'
      }]
    };
    */

    this.peerConnection = new RTCPeerConnection(stunConfiguration);

    var self = this;
    this.localStream.getTracks().forEach(function (track) {

      self.peerConnection.addTrack(track, self.localStream);
    });

    // Setup ice handling
    this.peerConnection.onicecandidate = this.handleOnIceCandidate.bind(this);
    // video

    this.peerConnection.ontrack = this.handleOnTrack.bind(this);

    // handle state changes
    this.peerConnection.onconnectionstatechange = this.handleOnPeerConnectionStateChange.bind(this);

    this.showAvailableUserList();

  }



  // handle the on ICE candidate event
  handleOnIceCandidate(event) {
    console.log("onicecandidate", event);

    if (event.candidate) {
      this.peerSignalingService.sendSignalingMessage("candidate", this.remoteVideoCallerId, {
        event: "candidate",
        data: event.candidate
      });
    }
  }

  // handle on track event

  handleOnTrack(event) {
    console.log("on track event", event);

    if (event.track.kind === "video") {
      console.log("on track>video")

      //createNewVideoElement(event);
      this.attachRemoteVideoStreamTrack(event);

      // console.log("adding video stream to remoteVideo target post", newVideo);
    } else {
      console.log("...")
    }
  }

  // handle peer connection close;
  handleOnPeerConnectionStateChange(event) {
    console.log("handleOnPeerConnectionStateChange", event)
    switch (this.peerConnection.connectionState) {

      case "connected": //this.checkForStoredOffer();
        break;
      case "disconnected": this.peerSignalingService.getToastMessageHandler()({
        severity: "error",
        summary: "Video Stream Disconnected",
        detail: "The stream peer has been disconnected. ",


      });
        // re initialize the local rtc peer
        this.initializeRTCPeer();
        break;
    }

  }

  // handle the call request accept message generated
  // by the peer signaling service when a user accepts an incoming call.
  handleCallRequestAccepted(data) {

    console.log("handleCallRequestAccepted");

    // toast the accept
    this.peerSignalingService.getToastMessageHandler()({
      severity: "info",
      summary: "Accept Call",
      detail: "Connecting to: " + data['callerDisplayName'],
      life: 4000

    })
  }

  // handle the call request reject message generated
  // by the peer signaling service when a user rejects an incoming call.
  handleCallRequestRejected(data) {

    console.log("handleCallRequestRejected");

    // toast the ignore
    this.peerSignalingService.getToastMessageHandler()({
      severity: "warn",
      summary: "Ignore Call",
      detail: "Ignoring video call from: " + data['callerDisplayName'],
      sticky: true

    });
  }

 
  // handle call request response
  handleCallRequestResponse(data) {

    console.log("handle call request response", data)

    // the user has accepted our call request
    if (data['accepted'] == true) {

      console.log("this.cancelCallFlag", this.cancelCallFlag);
      // check that we didnt cancel the call
      if (this.cancelCallFlag == false) {
        // create the offer
        this.createOffer();
      } else {
        // reset the cancel call flag for future calles
        // this.cancelCallFlag = false;
      }
    } else {
      // let the user know that the callee rejected
      // our call. 
      this.peerSignalingService.getToastMessageHandler()({
        severity: "info",
        summary: "Call could not complete",
        detail: "Your call was rejected!"


      });
    }
  }




  // close the current peer connection;
  closePeerConnection() {
    this.showAvailableUserList();
    // close the current peer connection

    this.peerConnection.close();
    this.sendHangupMessage();
    // re initialize the local rtc peer
    this.initializeRTCPeer();
  }

  // attach an incoming video stream to the remote video player
  attachRemoteVideoStreamTrack(event) {
    this.remoteVideoPlayer.setMediaStream(event.streams[0]);
  }



  // create a peer rtc call offer
  createOffer() {

    console.log("create offer");
    // obtain the createOffer promise
    var createOfferResult: Promise<RTCSessionDescriptionInit> = this.peerConnection.createOffer();
    this.showRemoteVideo();
    // process the createOffer promise
    var self = this;
    createOfferResult.then((offer) => {
      console.log("send event....", offer)
      this.peerSignalingService.sendSignalingMessage("offer", self.remoteVideoCallerId, {
        event: "offer",
        caller: self.localVideoCallerId,
        callee: self.remoteVideoCallerId,
        data: offer
      });
      console.log("set local description", offer);
      self.peerConnection.setLocalDescription(offer);
    })
      .catch((error) => {
        console.log("Error creating an offer", error);
      });

  }



  // create offer error handler
  createOfferErrorHandler(error) {
    console.log("Error creating an offer", error);
  }


  // handle offer 

  handleOffer(offer) {
    console.log("handleOffer", offer);
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    this.remoteVideoCallerId = offer.caller; // this caller is injected into message
    this.remoteVideoPlayer.setTitle(this.getUersEmailById(this.remoteVideoCallerId));
    this.remoteVideoPlayer.enableControls();
    var createAnswerResult: Promise<RTCSessionDescriptionInit> = this.peerConnection.createAnswer();
    createAnswerResult.then((answer) => {

      this.showRemoteVideo();
      console.log("createAnswerSuccesHandler-answer", answer);
      this.peerConnection.setLocalDescription(answer);
      console.log("send answer", this.remoteVideoCallerId);

      this.peerSignalingService.sendSignalingMessage("answer", this.remoteVideoCallerId,

        {
          event: "answer",

          data: answer
        });
    })
      .catch((error) => {
        console.log("createAnswerErrorHandler-error", error);
        this.peerSignalingService.getToastMessageHandler()(
          {
            severity: "info",
            summary: "Answering",

          }
        )
      });




  }

  // lookup a users email by user id;
  getUersEmailById(id: string): string {
    console.log("availableUsers getUserEmailById", id);
    console.log("availableUsers", this.availableUsers);
    var email = 'unknown';
    this.availableUsers.forEach(function (availableUser) {

      if (availableUser.value === 'id') {
        email = availableUser.label;
      }
    });
    for (let item of this.availableUsers) {
      if (true) {
        email = item.label
      }
    }
    return email;
  }

  // handle candidate
  handleCandidate(candidate) {
    console.log("handleCandidate", candidate);

    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  handleAnswer(answer) {
    console.log("handleAnswer", answer);

    this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    //pauseAudio(); // turn off ringer
    console.log("connection established successfully!!");
  }

  msgs: Message[] = [];

  // call confirmmation dialogs
  callRemotelUser(selectedItem) {

    this.cancelCallFlag = false;
    this.calleeName = selectedItem.label;
    // display a call confirmation dialog 
    this.peerSignalingService.getConfirmationDialogHandler()(
      "Call: " + selectedItem.label,
      this.callRemoteUserAccept.bind(this, selectedItem),
      this.callRemoteUserReject.bind(this)
    );

  }

  callRemoteUserAccept(selectedItem) {
    this.showCancelCallRequest();
    this.remoteVideoCallerId = selectedItem.value;
    this.remoteVideoPlayer.setTitle(this.calleeName);
    this.peerSignalingService.getToastMessageHandler()(
      {
        severity: "info",
        summary: "Calling",
        detail: "Calling: " + selectedItem.label

      }
    )
    /*
    this.createOffer();
    */
    this.peerSignalingService.sendSignalingMessage("call-request", selectedItem.value, {
      event: "call-request",
      callerDisplayName: this.peerSignalingService.getDisplayName(),
      callerId: this.peerSignalingService.getAccountId()
    });
  }
  callRemoteUserReject() {
    this.peerSignalingService.getToastMessageHandler()(
      {

        severity: "info",
        summary: "Call Canceled",

      }
    )
  }

  showIncomingCallDialog(connectionInfo) {
    //  playAudio(ringTone);
   
    var result = confirm("accept call from:" + connectionInfo.callerDisplayName);
    if (result) {


      this.showRemoteVideo();

    } else {
      alert("call ignored");
    }



  }

  // show remote video and hide available user list

  showRemoteVideo() {
    this.hideAvailableUserList = true;
    this.hideRemoteVideo = false;
    this.hideWaitingForCallResponse = true;
  }

  // show the available user list and hide the remote video

  showAvailableUserList() {
    this.hideAvailableUserList = false;
    this.hideRemoteVideo = true;
    this.hideWaitingForCallResponse = true;
  }

  // show the cancel call request

  showCancelCallRequest() {
    this.hideWaitingForCallResponse = false;
    this.hideAvailableUserList = true;
    this.hideRemoteVideo = true;
  }

  //swap available user list and remote video visibility
  toggleAvailableUserListAndRemoteVideo() {
    if (this.hideAvailableUserList) {
      this.hideAvailableUserList = false;
      this.hideRemoteVideo = true;
    } else {
      this.hideAvailableUserList = true;
      this.hideRemoteVideo = false;
    }
  }

  // if a call request has been started and the
  // requestor wants to cancel it.. 
  cancelCallRequest() {
    console.log("cancelCallRequest")
    this.showAvailableUserList();

    this.cancelCallFlag = true;
    this.peerSignalingService.getToastMessageHandler()({
      severity: "info",
      summary: "Call Canceled",
      detail: "<b>" + this.calleeName + "</b> call canceled.",
      life: 4000

    });
    this.peerSignalingService.sendSignalingMessage("call-request-canceled", this.remoteVideoCallerId,

      {
        event: "call-request-canceled",

        data: { 
          callerDisplayName: this.peerSignalingService.getDisplayName()
        }
      });
  }
  // signal hangup on an established call
  sendHangupMessage() {
    this.peerSignalingService.sendSignalingMessage("remote-hangup", this.remoteVideoCallerId,

      {
        event: "remote-hangup",

        data: {}
      });
  };
  //  handle a remote-hangup message
  handleRemoteHangup(data) {
    this.peerSignalingService.getToastMessageHandler()({
      severity: "info",
      summary: "Remote Hangup",
      detail: "The remote user disconnected the call.",
      life: 4000

    })
    this.showAvailableUserList();
  }


  // refresh the available user list
  refreshAvailableUserList() {
    this.peerSignalingService.getActiveUsers();
  }
}


//  RTC configuration implementation
export class VideoCallRTCConfiguration implements RTCConfiguration {
  iceServers: RTCIceServer[] = [new VideoCallRTCIceServer()]
}

// RTC ice server implemenation
export class VideoCallRTCIceServer implements RTCIceServer {
  urls: string[] = ['stun:stun.stunprotocol.org:3478'];
  url: string = 'stun:stun.stunprotocol.org:3478';
}
