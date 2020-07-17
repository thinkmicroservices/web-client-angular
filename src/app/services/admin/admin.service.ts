import { Injectable } from '@angular/core';
//import { UserProfile } from '../../services/account/profile/profile.service';
import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ApiService } from '../api-service/api-service.service';
import { LoggingService } from '../logging/logging.service';
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private httpClient: HttpClient,
    private apiService: ApiService,
    private logger: LoggingService) { }



  getUsers(userFilter: string, first, rowCount) {
    this.logger.debug("getUsers",userFilter,first,rowCount)
     
    //var userURL = "http://localhost:9999/all?like=" + userFilter + "&pageNo=" + first + "&pageSize=" + rowCount + "&sortBy=id" + "&ts=" + (new Date()).getTime();
    var userURL = this.apiService.getAdminService()+"/all?like=" + userFilter + "&pageNo=" + first + "&pageSize=" + rowCount + "&sortBy=id" + "&ts=" + (new Date()).getTime();

    return this.httpClient.get<UserResponse>(userURL ).toPromise()
    .then(res => <UserResponse>res).then(data=>{return data})     

  }

   getTelemetry(telemetryRequest: TelemetryRequest) {
    this.logger.debug("getTelemetry",telemetryRequest)
     
     
    var telemetryURL = this.apiService.getAdminService()+"/getTelemetryByAccountId";

    return this.httpClient.post<TelemetryResponse>(telemetryURL,telemetryRequest ).toPromise()
    .then(res => <TelemetryResponse>res).then(data=>{return data})     

  }

  setUserStatus(accountId:string, activeStatus: boolean){
    this.logger.debug("setUserStatus",accountId,status);
    //var userURL = "http://localhost:9999/setUserActiveStatus/"+accountId+"/?activeStatus="+activeStatus+"&ts="+ (new Date()).getTime();
    var userURL = this.apiService.getAdminService()+"/setUserActiveStatus/"+accountId+"/?activeStatus="+activeStatus+"&ts="+ (new Date()).getTime();

    return this.httpClient.post<string>(userURL ,{value:"x"} ).toPromise()
    .then(res => <string>res).then(data=>{return data})  
  }
}

export class UserResponse {
  constructor(
    public totalElements: number,
    public content: UserProfile[]

  ) { }
}

// UserProfile is a hybrid of the Profile + the User.activeStatus.
// 
export class UserProfile {

  constructor(

    public id: string,
    public accountId: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public middleName: string,

    public primaryStreetAddress: string,
    public secondaryStreetAddress: string,
    public city: string,
    public state: string,
    public postalCode: string,

    public dob: string,

    public profileImageId: string,
    public activeStatus: boolean

  ) { }
}

// TelemetryEvent
export class TelemetryEvent{

  constructor(
   public id: string,
   public timestamp: string,
   public source: string,
   public accountId: string,
   public level: string,
   public details: string[]
  ){}
}

// TelemetryRequest
//  "&pageNo=" + first + "&pageSize=" + rowCount + "&sortBy=id" + "&ts=" + (new Date()).getTime();

export class TelemetryRequest{
  constructor( 
      public page: number,
      public pageSize: number,
      public sortBy: string,
      public level: string[],
      public startDate: string,
      public endDate: string,
      public accountId :string
  ){}
}

export class TelemetryResponse {
  constructor(
    public totalElements: number,
    public resultList: TelemetryEvent[]

  ) { }
}
