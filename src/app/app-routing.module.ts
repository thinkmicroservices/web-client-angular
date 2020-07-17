import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { AccountComponent } from './components/account/account.component';
import { AdminComponent } from './components/admin/admin.component';
import { VideoCallComponent } from './components/video/video-call/video-call.component';

 
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { RecoverPasswordComponent } from './components/recover-password/recover-password.component';

import { ExpiredComponent } from './components/expired/expired.component';
import { AuthGuardService } from './guards/auth-guard/auth-guard.service';




const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'video-call', component: VideoCallComponent },
  { path: 'admin', component: AdminComponent },
 
  { path: 'login', component: LoginComponent },
 
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'recover-password', component: RecoverPasswordComponent },

  { path: 'register', component: RegisterComponent },
   { path: 'expired', component: ExpiredComponent },
//  { path: 'logout', component: LogoutComponent, canActivate: [AuthGuardService] },
    { path: 'logout', component: LogoutComponent },
  { path: '**', component: HomeComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }  
