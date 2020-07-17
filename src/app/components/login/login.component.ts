import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';

import {DialogModule} from 'primeng/components/dialog/dialog';
import {ButtonModule} from 'primeng/button';
 


import {MessageService} from 'primeng/components/common/messageservice';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss',
  ],
  styles: [ ],
  providers: [MessageService]
})




export class LoginComponent implements OnInit {

   // authenticationUrl = 'http://localhost:7777/authenticate';

      email = ''
      password = ''
      invalidLogin = false
      display: boolean = false; 
      msgs=[];

  
       showAuthSpinner=false;

  constructor(private router: Router,
    private authenticationservice: AuthenticationService,
    private messageService: MessageService
    ) { }

  ngOnInit() {
   
     this.display = true;
  }



   // **************************************
  checkLogin() {

    this.showAuthSpinner=true;
    this.messageService.clear(); // clear any messages

    (this.authenticationservice.authenticate( this.email, this.password).subscribe(
      data => {
            this.showAuthSpinner=true;
             this.invalidLogin = false;
        this.router.navigate(['/home']) ;
       
      },
    
      error => {
      console.log("auth error")
          this.showAuthSpinner=false;
      console.error(error)
        this.invalidLogin = true
 
        this.messageService.add({severity:'error', summary:'Invalid logon', detail:error.error.errorMessage});
        
       console.log("post message") 
      }
    )
    );

  }

}
