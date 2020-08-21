import { Injectable } from '@angular/core';
import { Publisher } from '../publisher';
import { LoggingLevel } from '../logginglevel';
import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ApiService } from '../../api-service/api-service.service';
//import { AuthenticationService } from '../../authentication/authentication.service';
@Injectable({
  providedIn: 'root'
})
export class TelemetryPublisherService {

  constructor(private httpClient: HttpClient,
    //private authenticationService: AuthenticationService,
    private apiService: ApiService) { }


  error(timestamp:Date,message: any, ...optionalParams: any[]) {
    this.sendLoggingEvent(LoggingLevel.ERROR, timestamp,message, optionalParams);

  }

  warn(timestamp:Date,message: any, ...optionalParams: any[]) {
    this.sendLoggingEvent(LoggingLevel.WARN, timestamp,message, optionalParams);
  }

  info(timestamp:Date,message: any, ...optionalParams: any[]) {
    this.sendLoggingEvent(LoggingLevel.INFO, timestamp,message, optionalParams);
  }

  debug(timestamp:Date,message: any, ...optionalParams: any[]) {
    this.sendLoggingEvent(LoggingLevel.DEBUG, timestamp,message, optionalParams);
  }


  //-----------------------------------
  getLoggingLevel() {
    //var id = this.authenticationService.getAccountId();
    var url = this.apiService.getTelemetryService() + "/level/no-user";
    console.log("url", url);
    // if (id !== null) {
   var httpOptions = { headers: new HttpHeaders({ 'authExempt': 'true' }) };
   
    this.httpClient.get<any>(url, httpOptions).subscribe(data => {
      console.log("remote logging level", data);
      // return data;
    })
    //}
  }

  //-----------------------------------
  sendLoggingEvent(logLevel: LoggingLevel, timestamp:Date,message:string, ...optional:any[]) {
    var source="browser";
    var ts= this.format(timestamp);
    var accountId= sessionStorage.getItem('accountID');
 // console.log("accountId",accountId); 
  if(accountId ){
     // console.log("sendLogEvent",ts,message.toString());
    var url = this.apiService.getTelemetryService() + "/log";
    //var httpOptions = { headers: new HttpHeaders({ 'authExempt': 'true' }) };
    var httpOptions = { headers: new HttpHeaders({ 'logging': 'true' }) };
    var opt:string[]=[];

    if(optional!= null){
      optional.forEach(element=>{ opt.push(element.toString())})
    }
    var request = {
      details: opt,
      message: message.toString(),
      level: logLevel.toString(),
      accountId: accountId,
      timestamp: ts,
      source: source
    }
    this.httpClient.post<any>(url, request, httpOptions).subscribe(data => {
      //console.log("sendLogEvent", data);
    });
  }
   }


    private format(d:Date){
   
    return d.getFullYear()+ "-"+
    this.pad((d.getMonth()+1),2) +"-"
    +this.pad(d.getDate(),2)+"T"+
    this.pad(d.getHours(),2)+":"+
    this.pad(d.getMinutes(),2)+":"+
    this.pad(d.getSeconds(),2)+"."+
    this.pad(d.getMilliseconds(),3)+"Z";
    
  }

  private pad(n:number, width:number){
    var result="";
    if(n<(10^(width-1))) {
      for(var idx=0;idx<width-1;idx++){
        result+="0";
      }

    }
    return result+n;
  }
}
