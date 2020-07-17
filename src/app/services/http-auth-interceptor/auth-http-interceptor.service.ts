import { Injectable } from '@angular/core';
import { HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse } from '@angular/common/http';
  import { Observable, throwError, BehaviorSubject } from 'rxjs';

import { catchError, filter, take, switchMap ,tap} from 'rxjs/operators';
import {Router} from '@angular/router';
 

import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})



// hats of to ... https://angular-academy.com/angular-jwt/



export class AuthHttpInterceptorService implements HttpInterceptor {

    isRefreshing:boolean=false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    public authenticationService: AuthenticationService,
    private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    console.log("intercepting",req.url)

    if (sessionStorage.getItem('email') && sessionStorage.getItem('token')) {

       req = this.addToken(req,this.authenticationService.getJWTToken());
       console.log("intercepting added header to req",req.headers)

    }

    return next.handle(req).pipe( tap(() => {},
      (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status !== 401) {
         return;
        }
        this.router.navigate(['login']);
      }
    }));

  }

  private addToken(request: HttpRequest<any>, jwtToken: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
  }


 // private isRefreshing = false;
//private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
  if (!this.isRefreshing) {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authenticationService.refreshToken().pipe(
      switchMap((token: any) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(token.jwt);
        return next.handle(this.addToken(request, token.jwt));
      }));

  } else {
    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        return next.handle(this.addToken(request, jwt));
      }));
  }
}
}