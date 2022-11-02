import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannelHandlerService {


  channels: string[]



  constructor() { 
    this.channels = ['memer']
    console.log('times')
  }

  getChannels(): string[]{
    return this.channels;
  }

  setChannels(channels : string[]) {
    console.log("testt")
    this.channels = channels;
    console.log("test service", this.channels)
  }
  
}
