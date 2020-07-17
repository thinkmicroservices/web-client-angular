import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ProfileService, Profile } from '../../../services/account/profile/profile.service';
import { HistoryService, HistoryEvent, HistoryResponse } from '../../../services/account/history/history.service';
import { LoggingService } from '../../../services/logging/logging.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { LazyLoadEvent } from 'primeng/components/common/api';
import { AuthenticationService, ChangePasswordModel } from '../../../services/authentication/authentication.service';
import { InputTextModule } from 'primeng/inputtext';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [MessageService]
})
export class ProfileComponent implements OnInit {

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
     this.states = this.getStates();
  }


  // update the current users profile
  updateProfile() {

    this.logger.debug('update profile-start', this.profile.dob);
    if (this.profile.dob == null) {
      this.profile.dob = '';
    } else {
      this.profile.dob = new Date(this.profile.dob).toString();
    }

    // this is an ugly hack to format the primeng calendar value
    this.logger.debug('dob:', this.profile.dob);
    if ((this.profile.dob !== null) && (this.profile.dob !== '')) {
      const newValue = new Date(new Date(this.profile.dob).toJSON().split('T')[0]);
      this.profile.dob = '' + (newValue.getMonth() + 1) + '/' + (newValue.getDate() + 1) + '/' + newValue.getFullYear();
    }



    this.profileService.saveProfile(this.accountId, this.profile).subscribe(data => {
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Profile Changes Saved.' });
      });

  }



  // upload the selected profile image
  onUpload(event, form) {
    this.logger.debug('upload', event);
    this.logger.debug('file name:', event.files[0].name);

    this.profileImageURL = 'assets/images/loading.gif';


    this.profileService.upload(event.files[0], this.profile.accountId, this.uploadSuccessful, this.uploadFailed, this);

    form.clear();


  }
  // callback when the image upload succeeds
  uploadSuccessful(context) {
    context.logger.debug('upload success');

    // wait a brief interval and redisplay the
    // the profile image
    setTimeout(function () {

      context.profileImageURL = 'http://localhost:5020/profile/image/' + sessionStorage.getItem('accountID');
      context.messageService.add({ severity: 'info', summary: 'File Upload', detail: 'Profile Image Updated.' });
      context.profileImageTimestamp = (new Date()).getTime();
      context.logger.debug('refreshed profile image', context);

    }, 2000);


  }

  // doh! upload failed callback... display an error message
  uploadFailed(context, response) {
    context.logger.debug('upload failed', response);
    context.messageService.add({ severity: 'error', summary: 'File Upload', detail: 'Profile Image Update failed.' });
  }

  // display the change password dialog
  showChangePasswordDialog() {
    this.logger.debug('change password');
    this.passwordChangeDialogDisplay = true;
  }

  // check the password and confirmation password
  // and call the change password service
  changePassword() {
    this.messageService.clear();
    // if (this.changePasswordModel.confirmPasswordMatchesNewPassword()) {
    //   this.logger.debug('password & confirmation dont match');
    //   this.messageService.add({ severity: 'error', summary: 'Change Password Failled', detail: 'Confirmation password doesnt match', key: 'cp' });
    //   this.passwordChangeDialogDisplay = true;
    //   return;
    // }
    this.logger.debug('password & confirmation  match');
    this.passwordChangeDialogDisplay = true;

    this.authenticationService.changePassword(  this.changePasswordModel)
      .then(response => {
        this.logger.debug("response",response);
        var data = response.body
        if (data.success === true) {
          this.changePasswordModel.resetFields();
          this.passwordChangeDialogDisplay = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Profile Changes Saved.' });
        } else {
          this.logger.error("change password failed",data.errorMessage);
          this.messageService.add({ severity: 'error', summary: data.errorMessage, detail: data.errorMessage, key: 'cp' }); 
        }
      }).catch(errorResponse => {
        this.logger.debug("error",errorResponse)
        this.logger.debug("error", errorResponse.error.errorMessage);
        this.messageService.add({ severity: 'error', summary: "Change Password Failed", detail: errorResponse.error.errorMessage, key: 'cp' });
      })
      .finally(() =>{
        this.logger.debug("finally");
      });




  }

  // cancel and close the password change dialog
  cancelChangePassword() {
    this.passwordChangeDialogDisplay = false;
  }


  // return an array of states

  getStates(): SelectItem[] {


    const states = [
      { label: 'Alabama', value: 'AL' },
      { label: 'Alaska', value: 'AK' },
      { label: 'American Samoa', value: 'AS' },
      { label: 'Arizona', value: 'AZ' },
      { label: 'Arkansas', value: 'AR' },
      { label: 'California', value: 'CA' },
      { label: 'Colorado', value: 'CO' },
      { label: 'Connecticut', value: 'CT' },
      { label: 'Delaware', value: 'DE' },
      { label: 'District of Columbia', value: 'DC' },
      { label: 'Federated States of Micronesia', value: 'FM' },
      { label: 'Florida', value: 'FL' },
      { label: 'Georgia', value: 'GA' },
      { label: 'Guam', value: 'GU' },
      { label: 'Hawaii', value: 'HI' },
      { label: 'Idaho', value: 'IO' },
      { label: 'Illinois', value: 'IL' },
      { label: 'Indiana', value: 'IN' },
      { label: 'Iowa', value: 'IA' },
      { label: 'Kansas', value: 'KS' },
      { label: 'Kentucky', value: 'KY' },
      { label: 'Louisiana', value: 'LA' },
      { label: 'Maine', value: 'ME' },
      { label: 'Marshall Islands', value: 'MH' },
      { label: 'Maryland', value: 'MD' },
      { label: 'Massachusetts', value: 'MA' },
      { label: 'Michigan', value: 'MI' },
      { label: 'Minnesota', value: 'MN' },
      { label: 'Mississippi', value: 'MS' },
      { label: 'Missouri', value: 'MO' },
      { label: 'Montana', value: 'MT' },
      { label: 'Nebraska', value: 'NE' },
      { label: 'Nevada', value: 'NV' },
      { label: 'New Hampshire', value: 'NH' },
      { label: 'New Jersey', value: 'NJ' },
      { label: 'New Mexico', value: 'NM' },
      { label: 'New York', value: 'NY' },
      { label: 'North Carolina', value: 'NC' },
      { label: 'North Dakota', value: 'ND' },
      { label: 'Northern Mariana Islands', value: 'MP' },
      { label: 'Ohio', value: 'OH' },
      { label: 'Oklahoma', value: 'OK' },
      { label: 'Oregon', value: 'OR' },
      { label: 'Palau', value: 'PW' },
      { label: 'Pennsylvania', value: 'PA' },
      { label: 'Puerto Rico', value: 'PR' },
      { label: 'Rhode Island', value: 'RI' },
      { label: 'South Carolina', value: 'SC' },
      { label: 'South Dakota', value: 'SD' },
      { label: 'Tennessee', value: 'TN' },
      { label: 'Texas', value: 'TX' },
      { label: 'Utah', value: 'UT' },
      { label: 'Vermont', value: 'VT' },
      { label: 'Virgin Island', value: 'VI' },
      { label: 'Virginia', value: 'VA' },
      { label: 'Washington', value: 'WA' },
      { label: 'West Virginia', value: 'WV' },
      { label: 'Wisconsin', value: 'WI' },
      { label: 'Wyoming', value: 'WY' }
    ];
    return states;
  }



}
