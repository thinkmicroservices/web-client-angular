import { Directive, Input, ElementRef, HostListener } from '@angular/core';


// https://medium.com/@mohammad.nicoll/image-fallback-for-broken-images-angular-aa3d5538ea0
@Directive({
  selector: 'img[appImageFallback]'
})


export class ImageFallbackDirective {

  @Input() appImageFallback: string;

  constructor(private eRef: ElementRef) { }

  @HostListener('error')
  loadFallbackOnError() {

    const element: HTMLImageElement = <HTMLImageElement> this.eRef.nativeElement;
    element.src = this.appImageFallback || 'https://via.placeholder.com/200'
  }

}
