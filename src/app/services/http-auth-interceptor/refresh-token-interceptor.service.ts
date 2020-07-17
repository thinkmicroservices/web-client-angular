 

import {throwError as observableThrowError,  Observable ,  BehaviorSubject, pipe } from 'rxjs';

import {take, filter, catchError, switchMap, finalize,map, } from 'rxjs/operators';
import { Injectable, Injector } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler,
     HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent, HttpErrorResponse } from "@angular/common/http";

import { AuthenticationService } from "../authentication/authentication.service";
import { Router } from '@angular/router';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor { 


    isRefreshingToken: boolean = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    constructor(private injector: Injector, private router: Router) {}

    addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
        var requestWithAuthToken= req.clone({ setHeaders: { Authorization: 'Bearer ' + token }})
        //console.log("requestWithAuthToken",requestWithAuthToken);
        return requestWithAuthToken;
    }

    

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any>{ //} Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
        const authService = this.injector.get(AuthenticationService);

        if(req.headers.get("authExempt")=="true"){
            //console.log("token exemption:",req.urlWithParams)
            return next.handle(req);
        }
        return next.handle(this.addToken(req, authService.getAuthToken())).pipe( 
            map((event ) => {
              //  if (event instanceof HttpResponse) {
                   // console.log('event--->>>', event);
                    // this.errorDialogService.openDialog(event);
              //  }else{
                   // console.log("--->",event)
             //   }
                return event;
            }),
            catchError(error => {
                if (error instanceof HttpErrorResponse) {
                    switch ((<HttpErrorResponse>error).status) {
                        case 400:
                            return this.handle400Error(error);
                        case 401:
                            return this.handle401Error(req, next);
                        default:
                            return observableThrowError(error);
                    }
                } else {
                    return observableThrowError(error);
                }
            })
      
            );
    }
 

    handle400Error(error) {
         console.log("handle400Error")
        if (error && error.status === 400 && error.error && error.error.error === 'invalid_grant') {
            // If we get a 400 and the error message is 'invalid_grant', the token is no longer valid so logout.
            return this.logoutUser("You have been logged out due to invalid privileges.");
        }

        return observableThrowError(error);
    }

    handle401Error(req: HttpRequest<any>, next: HttpHandler) {
        console.log("handle401Error")
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;

            // Reset here so that the following requests wait until the token
            // comes back from the refreshToken call.
            this.tokenSubject.next(null);

            const authService = this.injector.get(AuthenticationService);
            
            return authService.refreshToken().pipe(

                map((event: any ) => {
                
                // if (event instanceof HttpResponse) {
                //    console.log('event--->>>', event);
                    // this.errorDialogService.openDialog(event);
                //}else{
                //    console.log("--->",event)
                //}
                return event;
                 }),
                switchMap((newToken: string) => {
                    
                    console.log("received new Token", newToken);

                    if (newToken) {
                        this.tokenSubject.next(newToken);
                        return next.handle(this.addToken(req, newToken));
                    }

                    // If we don't get a new token, we are in trouble so logout.
                    return this.logoutUser("We are currently unable to refresh your authentication token so you have been logged out.");
                }),
                catchError(error => {
                    // If there is an exception calling 'refreshToken', bad news so logout.
                    return this.logoutUser("There was a problem refreshing your authentication token. You have been logged out.");
                }),
                finalize(() => {
                    this.isRefreshingToken = false; 
                }),);
                
        } else {
            return this.tokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(token => {
                    return next.handle(this.addToken(req, token));
                }),);
        }
    }

    

    logoutUser(message:string) {
        // Route to the login page (implementation up to you)
          const authService = this.injector.get(AuthenticationService);
          authService.logOut(message);
          
          this.router.navigate(['/logout']);
        return observableThrowError("");
    }
}

