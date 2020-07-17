import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

// the ApiService is a utility that allows switching between the API Gateway urls
// and direct service access urls.

export class ApiService {

  private apiGatewayEnabled = true;


  protocol = '';
  hostname = '';
  port = '';
  path='';

  private apiGatewayMap = {

    gateway: {
      
      apiPath: '/api/'
    },
    authentication: {
      directPort: 7777,
      apiPath: '/authentication',
      gatewayPath: '/api/authentication'

    },
    accountProfile: {
      directPort: 5020,
      apiPath: '/account/profile',
      gatewayPath: '/api/profile'
    },
    accountHistory: {
      directPort: 5010,
      apiPath: '/account/history',
      gatewayPath: '/api/history'
    },
    admin: {
      directPort: 9999,
      apiPath: '/admin',
      gatewayPath: '/api/admin'
    } ,
    telemetry: {
      directPort: 3000,
      apiPath: '/telemetry',
      gatewayPath: '/api/telemetry'
    },
    webrtcSignaling: {
      apiPath: '/conference',
      gatewayPath:"/api/peer-signaling/peer"
    }}


  



  constructor() {
    this.protocol = window.location.protocol;
    this.hostname = window.location.hostname;
    this.port = window.location.port;

    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('dev')){
      this.port='8443';
    }
    
  }

  private getBaseURL() {

    return this.protocol + '//' + this.hostname;
  }

  private getBaseURLAndPort() {
    return this.protocol + '//' + this.hostname + ':' + this.port;
  }

  private getAPIGatewayURLAndPort(){
     return this.protocol + '//' + this.hostname + ':' + this.port ;
  }

  getAuthentication() {

    if (this.apiGatewayEnabled) {
     // return this.getBaseURLAndPort() + this.apiGatewayMap.authentication.apiPath;
       return this.getAPIGatewayURLAndPort()+this.apiGatewayMap.authentication.gatewayPath;
    } else {

       return this.getBaseURL()+":"+this.apiGatewayMap.authentication.directPort;
    }

  }

  getAccountProfile() {
    if (this.apiGatewayEnabled) {
      return  this.getAPIGatewayURLAndPort()+ this.apiGatewayMap.accountProfile.gatewayPath;
      //return this.getBaseURLAndPort() + this.apiGatewayMap.accountProfile.apiPath;
    } else {
      console.log("base url", this.getBaseURL());
      return this.getBaseURL()+":"+this.apiGatewayMap.accountProfile.directPort;
    }
  }

  getAccountHistory() {
    if (this.apiGatewayEnabled) {
      return this.getAPIGatewayURLAndPort()+ this.apiGatewayMap.accountHistory.gatewayPath;
      //return this.getBaseURLAndPort() + this.apiGatewayMap.accountHistory.apiPath;
    } else {
      
      return this.getBaseURL()+":"+this.apiGatewayMap.accountHistory.directPort;
    }
  }

  getAdminService() {
    if (this.apiGatewayEnabled) {
      return this.getAPIGatewayURLAndPort()+this.apiGatewayMap.admin.gatewayPath;
      
    } else {
      
      return this.getBaseURL()+":"+this.apiGatewayMap.accountHistory.directPort;
    }
  }

  getTelemetryService() {
    if (this.apiGatewayEnabled) {
      return this.getAPIGatewayURLAndPort()+this.apiGatewayMap.telemetry.gatewayPath;
      
    } else {
      
      return this.getBaseURL()+":"+this.apiGatewayMap.telemetry.directPort;
    }
  }

  getSignalingService(){
    if(this.apiGatewayEnabled){
     
      return 'wss://' + this.hostname + ':' + this.port +this.apiGatewayMap.webrtcSignaling.gatewayPath;
    }else{

    }
  }
}
