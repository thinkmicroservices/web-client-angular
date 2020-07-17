import { Component, OnInit } from '@angular/core';
import { HistoryService, HistoryEvent, HistoryResponse } from '../../../services/account/history/history.service';
import { LoggingService } from '../../../services/logging/logging.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { LazyLoadEvent } from 'primeng/components/common/api';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  providers: [MessageService]
})
export class HistoryComponent implements OnInit {

  accountId = '';

  // event history
  cols: any[];

  totalRecords: number;
  loadingFlag: boolean;
  historyEvents: HistoryEvent[];
  selectedEvent: HistoryEvent;

  eventDetailsVisibleFlag = false;
  eventDetailsText: string;

 // constructor
  constructor( 
    private historyService: HistoryService,
    private messageService: MessageService,
    
    private logger: LoggingService,
  ) { }

  ngOnInit() {
    this.accountId = sessionStorage.getItem('accountID');
    // load history events
    this.cols = [
      // { field: 'id', header: 'id' },
      { field: 'accountId', header: 'Account Id' },
      { field: 'eventType', header: 'Event Type' },
      { field: 'timestamp', header: 'Timestamp' },

    ];
    this.loadingFlag = true;
    // preload the history events
    this.lazyLoadHistoryEvents({ first: 0, rows: 10 });

  }
   // History table
  // lazy load the specified history events page
  lazyLoadHistoryEvents(event: LazyLoadEvent) {
    this.logger.debug('lazyLoadHistoryEvents', event);
    this.loadingFlag = true;

    var accountIds: string[]=[this.accountId];
    //accountIds.push(this.accountId);

    this.historyService.getHistoryEvents(  event.first, event.rows,null,null,null,null,accountIds)
      .then(historyResponse => {
        this.logger.debug('historyEvents', historyResponse);
        this.historyEvents = this.decamelizeEventType(historyResponse.resultList);
        this.totalRecords = historyResponse.totalElements;
        this.loadingFlag = false;
      })
      .catch(error => {
        this.logger.error(error);
        this.messageService.add({ severity: 'error', summary: 'Account History Details', detail: 'Unable to load Account History Details.' });

      });


  }

  // converts the camel-case version of the HistoryEvent.eventType
  // to a white-space separated string
  decamelizeEventType(events: HistoryEvent[]) {
    events.forEach(event => event.eventType = event.eventType.replace(/([A-Z])/g, ' $1')

      .replace(/^./, function (str) { return ' ' + str.toUpperCase(); }));
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

}
