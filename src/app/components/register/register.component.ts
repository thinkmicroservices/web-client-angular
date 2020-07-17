import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { AuthenticationService , RegistrationModel} from '../../services/authentication/authentication.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { PasswordModule } from 'primeng/password';
import { TooltipModule } from 'primeng/tooltip';
import { LoggingService } from '../../services/logging/logging.service';
 

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],

  providers: [MessageService]
})



export class RegisterComponent implements OnInit {

  displayDialog = true;
  //registrationUrl : string;
  registrationModel: RegistrationModel;

  registrationFailed = false;
  msgs = [];

  constructor(private router: Router,
              private registerService: AuthenticationService,
              private messageService: MessageService,
              private logger: LoggingService,
              //private apiService: ApiService
  ) { }

  ngOnInit() {

    this.registrationModel= new RegistrationModel();
   // this.registrationUrl=this.apiService.getAuthentication()+"/register"
    this.displayDialog = true;
  }

  // ******
  registerUser() {

    this.messageService.clear(); // clear any messages


    this.registerService.register( this.registrationModel).then(response => {
        this.logger.debug('response', response);
        let data = response.body;
        if (data.success === true) {
          this.displayDialog=false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Registered user: '+this.registrationModel.email  });
          //this.router.navigate(['/home'])
        } else {
          this.logger.error('register user failed', data.errorMessage);
          this.messageService.add({ severity: 'error', summary: "Registration Error", detail: data.errorMessage  , key:'rd'});
        }
      }).catch(errorResponse => {
        this.logger.debug('error', errorResponse);
        this.logger.debug('error', errorResponse.error.errorMessage);
        this.messageService.add({ severity: 'error', summary: 'Register User Failed', detail: errorResponse.error.errorMessage , key:'rd' });
      })
      .finally(() => {
        this.logger.debug('finally');
      });

  

  }

}
