import { Injectable } from '@angular/core';
import { Publisher} from '../publisher';
import { LoggingLevel} from '../logginglevel';

@Injectable({
  providedIn: 'root'
})
export class ConsolePublisherService implements Publisher {

  constructor() { }

    error(timestamp:Date,message: any, ...optionalParams: any[]) {
    console.log(this.format(timestamp),LoggingLevel.ERROR, message, optionalParams);
  }

  warn(timestamp:Date,message: any, ...optionalParams: any[]) {
    console.log(this.format(timestamp),LoggingLevel.WARN, message, optionalParams);
  }

  info(timestamp:Date,message: any, ...optionalParams: any[]) {
    console.log(this.format(timestamp), LoggingLevel.INFO, message, optionalParams);
  }

  debug(timestamp:Date,message: any, ...optionalParams: any[]) {
    console.log(this.format(timestamp),LoggingLevel.DEBUG, message, optionalParams);
  }

  private format(d:Date){
   
    return d.getFullYear()+ "/"+(d.getMonth()+1)+"/"+d.getDate()+" "+
    this.pad(d.getHours(),2)+":"+
    this.pad(d.getMinutes(),2)+":"+
    this.pad(d.getSeconds(),2)+"."+
    this.pad(d.getMilliseconds(),3);
    
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
