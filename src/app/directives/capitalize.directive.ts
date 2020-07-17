import { Directive, ElementRef, HostListener } from '@angular/core';
@Directive({
  selector: '[appCapitalize]',
  host: {
    '(input)': '$event'
  }
})


export class CapitalizeDirective {
 
  constructor(public ref: ElementRef) { }

  @HostListener('input', ['$event']) onInput($event) 
  {
    
    if($event.target.value.length>0){
    $event.target.value=$event.target.value.substring(0,1).toUpperCase()+$event.target.value.substring(1);
    }
  }
}
