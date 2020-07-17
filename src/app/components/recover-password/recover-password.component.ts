import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { AuthenticationService, ResetPasswordModel } from '../../services/authentication/authentication.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { LoggingService } from '../../services/logging/logging.service';
@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss'],
  providers: [MessageService]
})



export class RecoverPasswordComponent implements OnInit {



  email = "";

  resetPasswordModel: ResetPasswordModel;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private logger: LoggingService

  ) { }

  ngOnInit() {
    this.resetPasswordModel = new ResetPasswordModel();
  }


  recoverPasswordWithEmail() {
    this.messageService.clear(); // clear any messages
    console.log("recover password for ", this.email);
    this.authService.recoverPassword(this.email).then(response => {
      this.logger.debug('response', response);
      let data = response.body;
      if (data != null) {

        this.messageService.add({ severity: 'success', summary: 'Password Recover', detail: 'Recovery code sent to: ' + data.email });

      } else {
        this.logger.error('recover password failed', data.errorMessage);
        this.messageService.add({ severity: 'error', summary: "Password Recovery Error", detail: data.errorMessage });
      }
    }).catch(errorResponse => {
      this.logger.debug('error', errorResponse);

      this.messageService.add({ severity: 'error', summary: 'Password Recovery Failed', detail: errorResponse.error });
    })
      .finally(() => {
        this.logger.debug('finally');
      });
  }


  resetPassword(){
    this.logger.debug("reset password");
    this.authService.resetPassword(this.resetPasswordModel).then(response => {
      this.logger.debug('response', response);
      let data = response.body;
      if (data != null) {

        this.messageService.add({ severity: 'success', summary: 'Password reset', detail: 'Password Reset for: ' + this.resetPasswordModel.email});

      } else {
        this.logger.error('  password resetfailed', data.errorMessage);
        this.messageService.add({ severity: 'error', summary: "Password Reset Error", detail: data.errorMessage });
      }
    }).catch(errorResponse => {
      this.logger.debug('error', errorResponse);

      this.messageService.add({ severity: 'error', summary: 'ResetPassword Failed', detail: errorResponse.error.errorMessage });
    })
      .finally(() => {
        this.logger.debug('finally');
      });
  }

}
