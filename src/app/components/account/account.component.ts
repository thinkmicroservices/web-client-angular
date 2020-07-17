import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ProfileService, Profile } from '../../services/account/profile/profile.service';
import { HistoryService, HistoryEvent, HistoryResponse } from '../../services/account/history/history.service';
import { LoggingService } from '../../services/logging/logging.service';

import { InputTextModule } from 'primeng/inputtext';
import { SelectItem } from 'primeng/api';
// import { DialogModule } from 'primeng/dialog';
// import { CalendarModule, Calendar } from 'primeng/calendar';
// import { PasswordModule } from 'primeng/password';
// import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/components/common/messageservice';
// import { CapitalizeDirective } from '../../directives/capitalize.directive';
// import { TitleizeDirective } from '../../directives/titleize.directive';
// import { ImageFallbackDirective } from '../../directives/image-fallback.directive';
// import { format } from 'url';

// import { TabViewModule } from 'primeng/tabview';

// import { PanelModule } from 'primeng/panel';

// import { PaginatorModule } from 'primeng/paginator';
// import { TableModule } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/components/common/api';
import { AuthenticationService, ChangePasswordModel } from 'src/app/services/authentication/authentication.service';
// import { FilterMetadata } from 'primeng/components/common/api';

 
 
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers: [MessageService]
})


export class AccountComponent implements OnInit {

   blockProfileUI: boolean; // used to block ui access

  accountId = '';
  profileImageURL = '';
  profileImageTimestamp = (new Date()).getTime();
  profile: Profile = new Profile('', '', '', '', '', '', '', '', '', '', '', null,'', '');
  uploadedFiles: any[] = [];
  remoteUploadURL = '';
  userform: FormGroup;
  states: SelectItem[];

  passwordChangeDialogDisplay = false;
 
  changePasswordModel = new ChangePasswordModel();
  changePasswordMsgs = [];

 

  // constructor
  constructor(private profileService: ProfileService,
    private historyService: HistoryService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private logger: LoggingService,
  ) { }

  ngOnInit() {

    // load the account profile
    this.accountId = sessionStorage.getItem('accountID');
    this.profileImageURL = 'http://localhost:5020/profile/image/' + this.accountId;
    this.remoteUploadURL = 'http://localhost:5020/profile/image/' + this.accountId;
    this.blockProfileUI=true;


    this.profileService.getProfile(this.accountId).subscribe(
      response => {

        this.logger.debug("profile response",response);
        this.profile = response;
        this.logger.debug("profile",this.profile);
        if (this.profile.dob === null) {
          this.profile.dob = '';
        }

       // this.blockProfileUI=true;
        this.logger.debug(this.profile);
      }
    );

    
    



  }
 
}




