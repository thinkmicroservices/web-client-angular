import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication/authentication.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'web-client';

  constructor(private router: Router,
    private authService: AuthenticationService) { }


  ngOnInit() {
    this.router.navigate(['/home'])
  }
}
