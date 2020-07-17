import { Injectable } from '@angular/core';
import { Publisher} from './publisher';
import { ConsolePublisherService} from './publisher/console-publisher.service';
import { TelemetryPublisherService} from './publisher/telemetry-publisher.service';

import { LoggingLevel} from './logginglevel';
@Injectable({
  providedIn: 'root'
})


// https://www.codemag.com/Article/1711021/Logging-in-Angular-Applications
// https://robferguson.org/blog/2017/09/09/a-simple-logging-service-for-angular-4/
//https://medium.com/@dneimke/configurable-logging-in-angular-projects-30dd5d999db6


// NOTE when logging to the console- make sure your browser is configured to display the level
// chrome: https://developers.google.com/web/tools/chrome-devtools/console/reference#level
// firefox: 

export class LoggingService {

  logLevel: LoggingLevel = LoggingLevel.DEBUG;
  publishers: Publisher[]=[];
  //consolePublisherService:ConsolePublisherService ;
   

  constructor(consolePublisherService:ConsolePublisherService,telemetryPublisherService:TelemetryPublisherService) { 

   
    this.publishers.push(consolePublisherService);
    this.publishers.push(telemetryPublisherService);

    telemetryPublisherService.getLoggingLevel();
  }

  
	 error(message: any, ...optionalParams: any[]) {
	  this.log(LoggingLevel.ERROR, message, optionalParams);
	}
  
	warn(message: any, ...optionalParams: any[]) {
	  this.log(LoggingLevel.WARN, message, optionalParams);
	}
  
	info(message: any, ...optionalParams: any[]) {
	  this.log(LoggingLevel.INFO, message, optionalParams);
	}
  
	debug(message: any, ...optionalParams: any[]) {
	  this.log(LoggingLevel.DEBUG, message, optionalParams);
	} 
  
  
  log(level = LoggingLevel.WARN, message: any, ...optionalParams: any[]) {

    let timestamp = new Date();

    if (this.shouldLog(level)) {
    
      switch (level) {

        case LoggingLevel.ERROR:
          this.publishers.forEach( publisher =>{
            publisher.error(timestamp,message,optionalParams);
          })
          break;

        case LoggingLevel.WARN:
          this.publishers.forEach( publisher =>{
            publisher.warn(timestamp,message,optionalParams);
          })
          break;

        case LoggingLevel.INFO:
          this.publishers.forEach( publisher =>{
            publisher.info(timestamp,message,optionalParams);
          })
          break;

        case LoggingLevel.DEBUG:
          this.publishers.forEach( publisher =>{
            publisher.debug(timestamp,message,optionalParams);
          })
          break;
      }
    }
  }

 
  private shouldLog(level: LoggingLevel) {

    if (this.logLevel === LoggingLevel.NONE) {

      return false;

    } else if (this.logLevel === LoggingLevel.ERROR) {

      return level === LoggingLevel.ERROR;

    } else if (this.logLevel === LoggingLevel.WARN) {

      return level === LoggingLevel.ERROR || level === LoggingLevel.WARN;

    } else if (this.logLevel === LoggingLevel.INFO) {

      return level === LoggingLevel.ERROR || level === LoggingLevel.WARN || level === LoggingLevel.INFO;

    } else {

      return true;
    }
  }


  
}


