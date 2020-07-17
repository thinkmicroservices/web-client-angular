import { UserProfile, TelemetryRequest } from '../../../services/admin/admin.service';
import { AdminService, TelemetryEvent } from '../../../services/admin/admin.service';

import { Component, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/components/common/api';
import { LoggingService } from '../../../services/logging/logging.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { HistoryService, HistoryEvent, HistoryResponse, HistoryEventType } from '../../../services/account/history/history.service';


@Component({
  selector: 'app-telemetry',
  templateUrl: './telemetry.component.html',
  styleUrls: ['./telemetry.component.scss'],
  providers: [MessageService]
})

export class TelemetryComponent implements OnInit {

  telemetryCols: any[];
  telemetryEventTypes: HistoryEventType[] = [
    {
      label: 'Error',
      value: 'ERROR'
    }
    ,
    {
      label: 'Warn',
      value: 'WARN'
    },
    {
      label: 'Info',
      value: 'INFO'
    },
    {
      label: 'Debug',
      value: 'DEBUG'
    }];


  telemetrySelectedEventTypes: string[]=[];
  telemetryEvents: TelemetryEvent[];
  telemetrySelectedEvent: TelemetryEvent;
  telemetryLoadingFlag: false;
  telemetryStartDate: Date = new Date();
  telemetryEndDate: Date = new Date();
  telemetryAccountId: string="";
  totalRecords: number;
  loadingFlag: boolean;
  blocked: boolean;

  constructor(private logger: LoggingService,
    private messageService: MessageService,
    private adminService: AdminService) { }

  ngOnInit() {
    this.telemetryCols = [
      { field: 'accountId', header: 'Account Id' },
      { field: 'timestamp', header: 'Timestamp' },
      { field: 'source', header: 'Source' },
      { field: 'level', header: 'Level' },

      { field: 'message', header: 'Message' },
      { field: 'Details', header: 'Details' },

    ];
    // set telemetry event start and end dates
    this.telemetryStartDate = this.getTodayMinusOne();
    this.telemetryEndDate = this.getTodayPlusOne();
    this.telemetrySelectedEventTypes.push("INFO");
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

  adjustForTimezone(date: Date): Date {
    var timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() - timeOffsetInMS);
    return date
  }



  // lazy load the specified history events page
  lazyLoadTelemetryEvents(event: LazyLoadEvent) {


    this.logger.debug('lazyLoadTelemetryEvents', event);
    this.loadingFlag = true;
    var startAdj = this.adjustForTimezone(this.telemetryStartDate).toISOString();
    var endAdj = this.adjustForTimezone(this.telemetryEndDate).toISOString();

    var accountIds: string[] = [];
    if ((this.telemetryAccountId == null) || (this.telemetryAccountId.trim().length > 0)) {
      accountIds.push(this.telemetryAccountId.trim());
    }
    var sortBy: string = "accountId";

    var telemetryRequest: TelemetryRequest = new TelemetryRequest(event.first, event.rows, sortBy, this.telemetrySelectedEventTypes,
      startAdj, endAdj, this.telemetryAccountId);

    this.adminService.getTelemetry(telemetryRequest)
      .then(telemetryResponse => {
        this.logger.debug('telemetryResponse', telemetryResponse);
        this.telemetryEvents = telemetryResponse.resultList;
        this.totalRecords = telemetryResponse.totalElements;
        this.telemetryLoadingFlag = false;
      })
      .catch(error => {
        this.logger.error(error);
        this.messageService.add({ severity: 'error', summary: 'Telemetry Details', detail: 'Unable to load Telemetry Events.' });

      });


  }
  refreshTelemetryEvents(event) {
    console.log("reload")

    this.lazyLoadTelemetryEvents({ first: 0, rows: 10 });

  }

  // display a dialog containing the sanitized version
  // of the history event;
  showTelemetryEventDetails(event, item) {
    this.logger.debug('history select:', event, item);
    //this.eventDetailsText = this.sanitizeEvent(item);
    // this.eventDetailsVisibleFlag = true;
  }
}
