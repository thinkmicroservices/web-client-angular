import { Component, OnInit } from '@angular/core';
import { HistoryService, HistoryEvent, HistoryResponse, HistoryEventType } from '../../../services/account/history/history.service';
import { AdminService , TelemetryEvent} from '../../../services/admin/admin.service';
import { LazyLoadEvent } from 'primeng/components/common/api';
import { LoggingService } from '../../../services/logging/logging.service';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  providers: [MessageService]
})
export class EventsComponent implements OnInit {

  // event history
   totalRecords: number;
  loadingFlag: boolean;
  blocked: boolean;

  eventHistoryCols: any[];

  eventHistoryTotalRecords: number;
  eventHistoryLoadingFlag: boolean;
  historyEvents: HistoryEvent[];
  historySelectedEvent: HistoryEvent;

  eventDetailsVisibleFlag = false;
  eventDetailsText: string;


  historyAccountId: string = "";
  historyEventTypes: HistoryEventType[];
  historySelectedEventTypes: string[];
  eventStartDate: Date = new Date();

  eventEndDate: Date = new Date();

  constructor(private logger: LoggingService,
    private messageService: MessageService,
    private adminService: AdminService,
    private historyService: HistoryService) { }

  ngOnInit() {
      // load history events
    this.eventHistoryCols = [
      // { field: 'id', header: 'id' },
      { field: 'accountId', header: 'Account Id' },
      { field: 'eventType', header: 'Event Type' },
      { field: 'timestamp', header: 'Timestamp' },

    ];
  
    
    this.eventHistoryLoadingFlag = true;
    // preload the history events  


    // set history event start and end dates
    this.eventStartDate = this.getTodayMinusOne();
    this.eventEndDate = this.getTodayPlusOne();

    this.historyService.getEventTypes().then(data => {

      this.historyEventTypes = []
      this.historySelectedEventTypes = []
      console.log("eventTypes", this.historySelectedEventTypes);
      data.forEach(
        typeVal => {

          this.historyEventTypes.push(new HistoryEventType(this.decamelize(typeVal.toString(), " "), typeVal.toString()));
          this.historySelectedEventTypes.push(typeVal.toString())
        }
      )
    })

    this.lazyLoadHistoryEvents({ first: 0, rows: 10 });
  }
  refreshEventHistory(event) {
    console.log("reload")

    this.lazyLoadHistoryEvents({ first: 0, rows: 10 });

  }
// History table
  // lazy load the specified history events page
  lazyLoadHistoryEvents(event: LazyLoadEvent) {

    console.log("selectedEventTypes", this.historySelectedEventTypes);
    this.logger.debug('lazyLoadHistoryEvents', event);
    this.loadingFlag = true;
    var startAdj = this.adjustForTimezone(this.eventStartDate).toISOString();
    var endAdj = this.adjustForTimezone(this.eventEndDate).toISOString();

    var accountIds: string[] = [];
    if ((this.historyAccountId == null) || (this.historyAccountId.trim().length > 0)) {
      accountIds.push(this.historyAccountId.trim());
    }
    var sortBy: string = null;


    this.historyService.getHistoryEvents(event.first, event.rows, sortBy, startAdj, endAdj, this.historySelectedEventTypes, accountIds)
      .then(historyResponse => {
        this.logger.debug('historyEvents', historyResponse);
        this.historyEvents = this.decamelizeEventType(historyResponse.resultList);
        this.totalRecords = historyResponse.totalElements;
        this.eventHistoryLoadingFlag = false;
      })
      .catch(error => {
        this.logger.error(error);
        this.messageService.add({ severity: 'error', summary: 'Account History Details', detail: 'Unable to load Account History Details.' });

      });


  }

    // converts the camel-case version of the HistoryEvent.eventType
  // to a white-space separated string
  decamelizeEventType(events: HistoryEvent[]) {
    events.forEach(event => {
      //event.eventType = event.eventType.replace(/([A-Z])/g, ' $1')

      //.replace(/^./, function (str) { return ' ' + str.toUpperCase(); }));
      event.eventType = this.decamelize(event.eventType, " ")
    })
    return events;
  }


 // display a dialog containing the sanitized version
  // of the history event;
  showHistoryEventDetails(event, item) {
    this.logger.debug('history select:', event, item);
    this.eventDetailsText = this.sanitizeEvent(item);
    this.eventDetailsVisibleFlag = true;
  }

  // close the event dialog
  closeEventDialog() {
    this.eventDetailsVisibleFlag = false;
  }

   // clone the item and remove any
  // items that we dont want displayed to the user
  sanitizeEvent(item) {
    // remove the id
    const clonedItem = Object.assign({}, item);
    delete clonedItem.id;


    return clonedItem;
  }
  //-------

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
    decamelize(str: string, separator: string) {
    separator = typeof separator === 'undefined' ? '_' : separator;

    return str
      .replace(/([A-Z])/g, ' $1')

      .replace(/^./, function (str) { return ' ' + str.toUpperCase(); });
  }
}
