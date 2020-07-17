import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { LoggingService } from '../../services/logging/logging.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  applicationBackgroundColor='#3b3a39';
  constructor(
    private elementRef: ElementRef,
    public authenticationService: AuthenticationService,
    private logger: LoggingService) { }

  ngOnInit() {
    this.logger.debug('initialized home component', this.authenticationService);
    if(this.authenticationService.isAlreadyAuthenticated()){
     console.log("already auth");
    }else{
     console.log("not logged in");
   //  this.authenticationService.logOut("Authentication Token expired. Logged out!");
    }
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = this.applicationBackgroundColor;
    
  }
}
