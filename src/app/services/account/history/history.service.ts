import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ApiService } from '../../api-service/api-service.service';
import { LoggingService } from '../../logging/logging.service';
@Injectable({
  providedIn: 'root'
})



export class HistoryService {

  constructor(private httpClient: HttpClient,
    private apiService: ApiService,
    private logger: LoggingService) { }




  getHistoryEvents(first:number, rowCount:number,sortBy: string, startDate:string,endDate:string,eventTypes: string[],accountIds:string[] ) {
   
    this.logger.debug("getHistoryEvent",accountIds,first,rowCount)

    let historyURL = `${this.apiService.getAccountHistory()}/find`;


    // calculate the page number
    let pageNumber = first / rowCount;
    let historyWithQueryURL = historyURL + "?pageNo=" + pageNumber + "&pageSize=" + rowCount + "&sortBy=" + "a" + "&ts=" + (new Date()).getTime();

    
    let historyRequest = new HistoryRequest(pageNumber,rowCount, sortBy, startDate, endDate,eventTypes,accountIds,);
   
    return this.httpClient.post<HistoryResponse>(historyURL,historyRequest).toPromise()
      .then(res => <HistoryResponse>res).then(data => { return data });
  }


  getEventTypes(){
    let historyURL = `${this.apiService.getAccountHistory()}/eventTypes`;
    return this.httpClient.get<HistoryEventType[]>(historyURL).toPromise()
    .then(res=><HistoryEventType[]>res).then(data=> {return data});
  }

 
}
 

export class HistoryEvent {


  constructor(
    public id: string,
    public eventType: string,
    public accountId: string,
    public timeStamp: string
  ) { }


}

export class HistoryResponse {
  constructor(
    public totalElements: number,
    public resultList: HistoryEvent[]
  ) { }
}


export class HistoryRequest{

  constructor(
    public page:number,
    public pageSize: number,
    public sortBy: string,
     public startDate: string,
    public endDate: string,
    public eventType: string[],
    public accountIds :string[],
   

  ){}
}

export class HistoryEventType{
 

  constructor( public label:string, public value:string){

  }

}


