import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from "rxjs";
import { Calendar } from 'primeng/calendar';

import { ApiService } from '../../api-service/api-service.service';



export class Profile {

  

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
    public phone: string,

    public profileImageId: string,

  ) { }

   
  
}


@Injectable({
  providedIn: 'root'
})

export class ProfileService {



  constructor(
    private httpClient: HttpClient,
    private apiService: ApiService
  ) { }


  getProfile(accountId){
    var url = this.apiService.getAccountProfile() + "/account/" + accountId;
  
    return this.httpClient.get<Profile>(url);
  }

  saveProfile(accountId, profile) {
    var url = this.apiService.getAccountProfile() + "/account/" + accountId;
   
    return this.httpClient.put<Profile>(url, profile);


  }

  updatePassword(accountId, newPassword) {

  }


  public upload(data, accountId, uploadSuccessCallback, uploadFailedCallback, context) {

    console.log()
    let profileURL = `${this.apiService.getAccountProfile()}/image/${accountId}`;
    console.log("profileurl", profileURL);


    const formData: FormData = new FormData();
    const file = data;

    formData.append('file', file, file.name);
    this.httpClient
      .post<any>(profileURL, formData)
      .subscribe(
        val => {
          console.log("POST call successful value returned in body",
            val);
        },
        response => {
          console.log("POST call in error", response);
          uploadFailedCallback(context, response);
        },
        () => {

          console.log("The POST observable is now completed! schedule image refresh");
          uploadSuccessCallback(context);

        }
      );
  }


}
