import { Component, OnInit } from '@angular/core';
import { HistoryService, HistoryEvent, HistoryResponse, HistoryEventType } from '../../../services/account/history/history.service';
import { SelectItem } from 'primeng/api';
import { UserProfile, TelemetryRequest } from '../../../services/admin/admin.service';
import { AdminService, TelemetryEvent } from '../../../services/admin/admin.service';
import { LazyLoadEvent } from 'primeng/components/common/api';
import { LoggingService } from '../../../services/logging/logging.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  providers: [MessageService]
})
export class UsersComponent implements OnInit {

   accountId = '';
  displayUserDialog: boolean;

  users: UserProfile[];
  selectedUser: UserProfile;
  cols: any[];
  keyword: string = '';

  totalRecords: number;
  loadingFlag: boolean;
  blocked: boolean;

  constructor(private logger: LoggingService,
    private messageService: MessageService,
    private adminService: AdminService,
    private historyService: HistoryService) { }

  ngOnInit() {
    this.accountId = sessionStorage.getItem("accountID");
    this.displayUserDialog = false;

    this.lazyLoadUserProfiles({ first: 0, rows: 10 });

    this.cols = [
      { field: 'accountId', header: 'Account Id' },
      { field: 'email', header: 'email' },
      { field: 'firstName', header: 'First' },
      { field: 'middleName', header: 'Middle' },
      { field: 'lastName', header: 'Last' },
      { field: 'activeStatus', header: 'Active' }
    ];

    this.selectedUser = new UserProfile('', '', '', '', '', '', "", '', '', '', '', '', '', false);


  }

  getTodayMinusOne(): Date {
    var now = new Date();
    now = this.adjustForTimezone(now);
    now.setDate(now.getDate() - 1);
    return now;
  }
  getTodayPlusOne(): Date {
    var now = new Date();
    now = this.adjustForTimezone(now);
    now.setDate(now.getDate() + 1);
    return now;
  }

  filterUpdated() {
    this.loadUserProfiles(this.keyword, 0, 10)
  }

  lazyLoadUserProfiles(event: LazyLoadEvent) {
    this.logger.debug('lazyLoadUserProfiles', event);
    this.loadUserProfiles(this.keyword, event.first, event.rows)
  }

  loadUserProfiles(filter, first, rows) {

    if (filter === '') {
      filter = '.'; // we do this to pass the regex (/./) if no filter regex is supplied
    }
    this.loadingFlag = true;
    this.blocked = true;
    this.adminService.getUsers(filter, first, rows)
      .then(userResponse => {
        this.logger.debug('userResponse', userResponse)
        this.totalRecords = userResponse.totalElements;




        this.users = (userResponse.content);
        this.loadingFlag = false;
        this.blocked = false;
      })
      .catch(error => {
        this.logger.error(error);
        this.messageService.add({ severity: 'error', summary: 'Account History Details', detail: 'Unable to load Account History Details.' });
        this.loadingFlag = false;
        this.blocked = false;
      });


   

  }

  showProfileDetails(event, item: UserProfile) {
    this.logger.debug('profile detail select:', event, item);
    this.selectedUser = item;
    this.displayUserDialog = true;


  }
   handleUserStatusChange(event) {
    this.adminService.setUserStatus(this.selectedUser.accountId, this.selectedUser.activeStatus)
      .then(response => {
        this.logger.debug("status changed to", response)
      })
  }




  decamelize(str: string, separator: string) {
    separator = typeof separator === 'undefined' ? '_' : separator;

    return str
      .replace(/([A-Z])/g, ' $1')

      .replace(/^./, function (str) { return ' ' + str.toUpperCase(); });
  }


  adjustForTimezone(date: Date): Date {
    var timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() - timeOffsetInMS);
    return date
  }
}
