import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AccordionModule } from 'primeng/components/accordion/accordion';
import { PanelModule } from 'primeng/components/panel/panel';
import { ButtonModule } from 'primeng/components/button/button';
 
import { DialogModule} from 'primeng/components/dialog/dialog';

import { MessagesModule} from 'primeng/components/messages/messages';
import { MessageModule} from 'primeng/components/message/message';


import {InputTextModule} from 'primeng/inputtext';

import { Message} from 'primeng/components/common/message';
import { MessageService} from 'primeng/components/common/messageservice';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
 
 
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
 
 
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';

import { RegisterComponent } from './components/register/register.component';
 

import {PasswordModule} from 'primeng/password';
import {TooltipModule} from 'primeng/tooltip';

import {CalendarModule} from 'primeng/calendar';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
 



//import { AuthHttpInterceptorService } from './services/http-auth-interceptor/auth-http-interceptor.service';
import { AuthHttpInterceptor } from './services/http-auth-interceptor/refresh-token-interceptor.service';

import { HomeComponent } from './components/home/home.component';
import { RecoverPasswordComponent } from './components/recover-password/recover-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AccountComponent } from './components/account/account.component';
import { AdminComponent } from './components/admin/admin.component';

import { ToastModule} from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';

import { PaginatorModule } from 'primeng/paginator'
import {TableModule} from 'primeng/table';
import { LazyLoadEvent } from 'primeng/components/common/api';
import { FilterMetadata } from 'primeng/components/common/api';

 import {TabViewModule} from 'primeng/tabview';
 import {DropdownModule} from 'primeng/dropdown';

 import {BlockUIModule} from 'primeng/blockui';

 import {InputSwitchModule} from 'primeng/inputswitch';

 import {TreeModule} from 'primeng/tree';

 import {ListboxModule} from 'primeng/listbox';
// custom directives
import { CapitalizeDirective } from './directives/capitalize.directive';
import { TitleizeDirective } from './directives/titleize.directive';
import { ImageFallbackDirective } from './directives/image-fallback.directive';
import { ExpiredComponent } from './components/expired/expired.component';
import { TelemetryComponent } from './components/admin/telemetry/telemetry.component';
import { EventsComponent } from './components/admin/events/events.component';
import { ServicesComponent } from './components/admin/services/services.component';
import { UsersComponent } from './components/admin/users/users.component';
import { ProfileComponent } from './components/account/profile/profile.component';
import { HistoryComponent } from './components/account/history/history.component';
import { VideoCallComponent } from './components/video/video-call/video-call.component';
 
import { VideoPlayerComponent } from './components/video/video-player/video-player.component';


 
@NgModule({
  declarations: [

    AppComponent,
 
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    LogoutComponent,
    HomeComponent,
    RecoverPasswordComponent,
    ResetPasswordComponent,
    AccountComponent,
    AdminComponent,
 
    CapitalizeDirective,
    TitleizeDirective,
    ImageFallbackDirective,
    ExpiredComponent,
    TelemetryComponent,
    EventsComponent,
    ServicesComponent,
    UsersComponent,
    ProfileComponent,
    HistoryComponent,
    VideoCallComponent,
 
    VideoPlayerComponent   
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
     BrowserAnimationsModule,
    FormsModule,
    AccordionModule,
    PanelModule,
    ButtonModule,
    	BlockUIModule,
    DialogModule,
    MessagesModule,
    MessageModule,
    PasswordModule,
    TooltipModule,
    CalendarModule,
    ToastModule,
    FileUploadModule,
    PaginatorModule,
    TableModule,
    ToggleButtonModule,
    TabViewModule,
    InputSwitchModule,
    TreeModule,
    ListboxModule,
    ConfirmDialogModule
  
    
    //MessageService,
    //Message,
  ],
   providers: [
  {  
    //provide:HTTP_INTERCEPTORS, useClass:AuthHttpInterceptorService, multi:true
     provide:HTTP_INTERCEPTORS, useClass:AuthHttpInterceptor, multi:true  
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
