import { Component, OnInit, } from '@angular/core';
import { AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {

  private title: string = "user";
  @ViewChild('video', { static: false }) video: any;

  constructor() {
    this.title = "-";
  }

  ngOnInit() {

  }
  ngAfterViewInit() {

  }

  setTitle(newTitle: string) {
    this.title = newTitle;
  }


  // configure the native video element media stream and set the stream 
  setMediaStream(mediaStream) {
    console.log("local media stream set to:", mediaStream);
    this.video.nativeElement.srcObject = mediaStream;
    this.video.nativeElement.muted = true;
    this.video.nativeElement.autoplay = true;
    this.video.nativeElement.playsinline = true;
    this.video.nativeElement.controls = false;
    this.video.nativeElement.play();
  }

  enableControls() {
    this.video.nativeElement.controls = true;
  }
  disableControls(){
    this.video.nativeElement.controls = false;
  }


  // adds an external event listener to the native video element
  // supported media events can be found at:
  // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
  addEventListener(eventType: string, eventCallback, flag?: boolean) {
    this.video.nativeElement.addEventListener(eventType, eventCallback, flag);
  }

}
