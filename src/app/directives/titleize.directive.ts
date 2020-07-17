import { Directive, ElementRef, HostListener } from '@angular/core';
import { CapitalizeDirective } from './capitalize.directive';
@Directive({
  selector: '[appTitleize]',
  host: {
    '(input)': '$event'
  }
})


export class TitleizeDirective {

  constructor(public ref: ElementRef) { }

  @HostListener('input', ['$event']) onInput($event) {

    if ($event.target.value.length > 0) {

      var words = $event.target.value.split(" ");
      var result = '';
      for (var index = 0; index < words.length; index++) {
        words[index] = this.capitalize(words[index]);
      }
      $event.target.value = words.join(" ");




    }
  }

  capitalize(word) {
    if (word.length > 0) {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    } else {
      return word;
    }
  }

}
