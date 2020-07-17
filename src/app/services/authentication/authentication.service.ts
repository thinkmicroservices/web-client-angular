import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { catchError, mapTo, tap } from 'rxjs/operators';
import { share, map, delay } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode'; // https://onthecode.co.uk/decode-json-web-tokens-jwt-angular/

import { LoggingService } from '../logging/logging.service';
import { ApiService } from "../api-service/api-service.service";
import { ProfileService, Profile } from "../account/profile/profile.service";
import { PeerSignalingService } from '../peer-signaling/peer-signaling.service';
export class User {


  constructor(
    public status: string,
  ) { }

}

export class JwtResponse {
  constructor(
    public jwttoken: string,
  ) { }

}

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {



  private readonly JWT_AUTH_TOKEN = 'jwt_auth_token';
  private readonly JWT_REFRESH_TOKEN = "jwt_refresh_token";
  private logoutMessage: string = "you have been logged-out";
  private accountProfile: Profile = null;

  accountDisplayName: string;

  constructor(
    private httpClient: HttpClient,
    private logger: LoggingService,
    private apiService: ApiService,
    private profileService: ProfileService,
    private signalingService: PeerSignalingService
  ) {
  }

  // ----------------------------------

  authenticate(email, password) {
    var url = this.apiService.getAuthentication() + "/authenticate";
    this.logger.debug("authenticate using url:" + url)

    var httpOptions = { headers: new HttpHeaders({ 'authExempt': 'true' }) };

    return this.httpClient.post<any>(url, { email, password },
      httpOptions
    ).pipe(
      map(
        userData => {
          sessionStorage.setItem('email', email);
          this.accountDisplayName = email;
          this.logger.debug(userData);

          // store the token
          let tokenStr = userData.token;
          this.logger.debug("tokenString", tokenStr);

          var decodedToken = jwt_decode(userData.token);
          this.logger.debug("decodeToken", decodedToken);
          var accountID = decodedToken['accountID'];

          this.logger.debug("accountID", accountID);
          this.setJWTToken(tokenStr);
          sessionStorage.setItem('roles', decodedToken['roles'])
          sessionStorage.setItem('accountID', accountID);

          this.setRefreshToken(decodedToken['refresh_token']);

          // notify authenticated user name change listeners
          this.notifyAuthenticatedUsernameChangeListeners(email);


          this.profileService.getProfile(accountID).subscribe(
            response => {

              this.logger.debug("profile response", response);

              this.setProfile(response);


            }
          );



          // connect to the peer signaling service

          this.signalingService.connect();

          return userData;
        }
      )

    );
  }


  public setProfile(profile) {

    this.accountProfile = profile;
    // if we have an account profile set the display name
    // concatenate the profile name fields to
    // create the profile display name
    if (this.accountProfile != null) {
      var displayName = "";
      // guard against empty fields
      if ((this.accountProfile.firstName != null) && (this.accountProfile.firstName !== "")) {
        displayName += this.accountProfile.firstName;
      }

      if ((this.accountProfile.middleName != null) && (this.accountProfile.middleName !== "")) {
        // only add the leading space separator of necessary 
        if (displayName.length > 0) {
          displayName += " ";
        }
        displayName += this.accountProfile.middleName;
      }

      if ((this.accountProfile.lastName != null) && (this.accountProfile.lastName !== "")) {
        // only add the leading space separator of necessary
        if (displayName.length > 0) {
          displayName += " ";
        }
        displayName += this.accountProfile.lastName;
      }

      if (displayName !== "") {
        this.accountDisplayName = displayName;
      }

    }
    this.setDisplayName(displayName);

  }
  // ----------------------------------
  public getAccountId(): string {
    return sessionStorage.getItem('accountID');
  }

  public getUserEmail(): string {
    return sessionStorage.getItem('email');
  }

  public setDisplayName(displayName: string) {
    this.accountDisplayName = displayName;
    sessionStorage.setItem("displayName", displayName);
  }

  public getDisplayName(): string {

    return sessionStorage.getItem("displayName");
  }

  // ----------------------------------


  refreshToken(): Observable<string> {
    //alert("refreshToken")
    console.log("refresh token...")
    const url = this.apiService.getAuthentication() + "/refreshToken/" + this.getRefreshToken();
    console.log("refresh url", url)
    var httpOptions = {
      headers: new HttpHeaders({
        'authExempt': 'true',
        //'refreshToken': 'true'//, 'observe': 'response'
      })
    };


    var response = this.httpClient.get<any>(url, httpOptions);
    console.log("refresh response", response);

    /*
     response.subscribe(
      refreshResponse => {console.log("observable refreshResponse",refreshResponse);
    console.log("refresh token response", refreshResponse);
         // alert("refresh token map")
          console.log("refresh token response", refreshResponse)
  
          let tokenStr: string = String(refreshResponse.token);
  
          this.logger.debug("tokenString", tokenStr);
  
          var decodedToken = jwt_decode(tokenStr);
          this.logger.debug("decodeToken", decodedToken);
          var accountID = decodedToken['accountID'];
  
          this.logger.debug("accountID", accountID);
          this.setJWTToken(tokenStr);
          sessionStorage.setItem('roles', decodedToken['roles'])
          sessionStorage.setItem('accountID', accountID);
  
          this.setRefreshToken(decodedToken['refresh_token']);
          var newObservable= of(this.getJWTToken()) ;
          console.log("newObservable",newObservable)
         return newObservable;
    
    });
    
    */
    return response.pipe(
      map(data => {
        console.log("refresh token response", data);
        //alert("refresh token map")
        console.log("refresh token response", data)

        let tokenStr: string = String(data.token);

        this.logger.debug("tokenString", tokenStr);

        var decodedToken = jwt_decode(tokenStr);
        this.logger.debug("decodeToken", decodedToken);
        var accountID = decodedToken['accountID'];

        this.logger.debug("accountID", accountID);
        this.setJWTToken(tokenStr);
        sessionStorage.setItem('roles', decodedToken['roles'])
        sessionStorage.setItem('accountID', accountID);

        this.setRefreshToken(decodedToken['refresh_token']);
        return tokenStr;
      })
    )


  }


  getAuthToken() {
    return this.getJWTToken();
  }

  // ----------------------------------

  isAlreadyAuthenticated(): boolean {
    if (this.getAuthToken() === null) {
      return false;
    }
    if (this.isTokenExpired(this.getAuthToken())) {
      // remove the token
      this.sessionCleanup();
      return false;
    } else {
      // reconnect to the signaling service
      this.signalingService.connect();
      return true;
    }
  }
  // ----------------------------------


  isTokenExpired(token: string): boolean {
    //if(!token) token = this.getToken();
    if (!token) return true;

    const date = this.getTokenExpirationDate(token);
    if (date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
  }

  // ----------------------------------


  getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }



  // ----------------------------------



  setJWTToken(jwtToken: string) {
    sessionStorage.setItem(this.JWT_AUTH_TOKEN, jwtToken);
  }


  // ----------------------------------


  getJWTToken() {
    return sessionStorage.getItem(this.JWT_AUTH_TOKEN);
  }


  // ----------------------------------


  setRefreshToken(refreshToken: string) {
    sessionStorage.setItem(this.JWT_REFRESH_TOKEN, refreshToken);


  }

  // ----------------------------------


  getRefreshToken(): string {
    return sessionStorage.getItem(this.JWT_REFRESH_TOKEN);
  }



  // ----------------------------------

  register(model: RegistrationModel) {
    var url = this.apiService.getAuthentication() + "/register";
    console.log("auth invoking:" + url)
    return this.httpClient.post<any>(url, model, { observe: 'response' }).toPromise();

  }
  // ---------------------------------
  changePassword(model: ChangePasswordModel) {
    var url = this.apiService.getAuthentication() + "/changePassword";
    console.log("change password")

    return this.httpClient.post<any>(url, model, { observe: 'response' }).toPromise();

  }
  // ---------------------------------
  recoverPassword(email: string) {
    var url = this.apiService.getAuthentication() + "/recoverPassword";
    console.log("change password")

    return this.httpClient.post<any>(url, { email: email }, { observe: 'response' }).toPromise();

  }

  // ---------------------------------
  resetPassword(resetPasswordModel: ResetPasswordModel) {
    var url = this.apiService.getAuthentication() + "/resetPassword";
    return this.httpClient.post<any>(url, resetPasswordModel, { observe: 'response' }).toPromise();
  }

  // ----------------------------------
  userHasRole(roleName) {
    var userRoles = sessionStorage.getItem('roles');
    if (userRoles != null) {
      if (userRoles.includes(roleName)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // ----------------------------------
  isUserLoggedIn() {
    let user = sessionStorage.getItem('email')
    //console.log(!(user === null))
    return !(user === null)
  }

  // ----------------------------------
  logOut(message: string) {
    // disconnect from the signaling service
    this.logoutMessage = message;
    this.sessionCleanup();
    console.log("message", this.getLogoutMessage());
  }

  sessionCleanup() {
    this.signalingService.signalingConnectionDisconnect();

    sessionStorage.removeItem('email');
    sessionStorage.removeItem(this.JWT_AUTH_TOKEN);
    sessionStorage.removeItem(this.JWT_REFRESH_TOKEN);
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('accountID');
  }

  getLogoutMessage(): string {
    return this.logoutMessage;
  }

  // array of listener callbacks for
  // authenticated user name changes 
  authenticatedUserNameChangeListeners: any[] = [];

  // register a name change listener callback
  registerAuthenticatedUserNameChangeListener(callback) {
    this.authenticatedUserNameChangeListeners.push(callback);

  }
  // notify authenticate name change listeners
  notifyAuthenticatedUsernameChangeListeners(newAuthenticateUserName) {

    this.authenticatedUserNameChangeListeners.forEach(function (callback) {
      callback(newAuthenticateUserName)
    });
  }
}
// ----------------------------------------------------

export class RegistrationModel {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;

  constructor() {
    this.resetFields();
  }

  resetFields() {
    this.firstName = '';
    this.middleName = '';
    this.lastName = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }
}
export class ChangePasswordModel {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  constructor() {
    this.resetFields();
  }
  // check the confirm password match new
  confirmPasswordMatchesNewPassword() {
    if (this.newPassword === this.confirmPassword) {
      return true;
    }
    return false;
  }
  resetFields() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}

export class ResetPasswordModel {
  email: string;
  recoveryCode: string;
  newPassword: string;
  passwordConfirm: string;

  constructor() {
    this.resetFields();
  }

  resetFields() {
    this.email = '';
    this.recoveryCode = '';
    this.newPassword = '';
    this.passwordConfirm = '';

  }
}

