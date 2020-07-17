import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { Router } from '@angular/router';
 

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})



export class LogoutComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService,
  
    private router: Router) {

  }

  ngOnInit() {
    
    
  } 

  getLogoutMessage():string {

    return this.authenticationService.getLogoutMessage();
  }

}
