import { Component, OnInit, ɵflushModuleScopingQueueAsMuchAsPossible } from '@angular/core';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { Router } from '@angular/router';
import { PeerSignalingService, PeerSignalingConnectionStatus } from 'src/app/services/peer-signaling/peer-signaling.service';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [ConfirmationService, MessageService]
})

export class HeaderComponent implements OnInit {

  authenticatedUserName: string = "...";

  signalingConnectionStatusImage: string;
  signalingConnectionStatusTooltip: string;

  confirmationHeaderTitle="Confirm";
  confirmationHeaderPosition="topright";

  constructor(public authenticationService: AuthenticationService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private signalingService: PeerSignalingService) {

    this.peerSignalingConnectionStatusChange(PeerSignalingConnectionStatus.CONNECTING);
    signalingService.registerConnectionStatusCallback(this.peerSignalingConnectionStatusChange.bind(this));

    // register a callback for when the authenticated user name changes
    this.authenticationService.registerAuthenticatedUserNameChangeListener(this.authenticatedUserNameChangeListener.bind(this));

    //pass the confirmation dialog function

    this.signalingService.setConfirmationDialogHandler(this.showConfirmDialog.bind(this));
    this.signalingService.setToastMessageHandler(this.showToastMessage.bind(this));
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


  setConnectedState() {
    this.signalingConnectionStatusImage = "assets/images/connection-connected.png";
    this.signalingConnectionStatusTooltip = "Connected";
    this.messageService.add({ severity: 'success', summary: 'Peer Service Connected', detail: 'Peer services are now available', life: 10000 });
  }


  setConnectingState() {
    this.signalingConnectionStatusImage = "assets/images/connection-connecting.png";
    this.signalingConnectionStatusTooltip = "Connecting...";
    this.messageService.add({ severity: 'info', summary: 'Peer Service Connecting', detail: 'Connecting to peer service...', life: 50000 });
  }

  setDisconnectedState() {
    this.signalingConnectionStatusImage = "assets/images/connection-disconnected.png"
    this.signalingConnectionStatusTooltip = "Disconnected";
    this.messageService.add({ severity: 'warn', summary: 'Peer Service Disconnected', detail: 'Peer services are unavailable', life: 5000 });
  }

  setErrorState() {
    this.signalingConnectionStatusImage = "assets/images/connection-error.png";
    this.signalingConnectionStatusTooltip = "Error Connecting!";
    this.messageService.add({ severity: 'error', summary: 'Peer Service Error', detail: 'Peer services will be unavailable', sticky: true });
  }


  navbarOpen = false;

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  ngOnInit() {

  }

  // authenticated user name change callback
  authenticatedUserNameChangeListener(newAuthenticatedUserName) {
    this.authenticatedUserName = newAuthenticatedUserName;
  }

  // log the user out
  logout() {
    this.toggleNavbar();
    this.authenticationService.logOut("You have successfully logged out.")
    this.router.navigate(["logout"]);
  }



  // this utility method allows us to use a common confirmation dialog
  // for both background and foreground operations
  showConfirmDialog(confirmationMessage, acceptCallback, rejectCallback) {

    this.confirmationService.confirm({
      message: confirmationMessage,
      accept: () => acceptCallback(),
      reject: () => rejectCallback()
    });

    
  }

  
  

  // this utility method allows us to use a common toast message
  // for both background and foreground operations 
  
  showToastMessage(toastMessageObj: any) {
    this.messageService.add(toastMessageObj);
  }


}
