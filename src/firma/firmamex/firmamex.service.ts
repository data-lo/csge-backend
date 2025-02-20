import { Injectable } from '@nestjs/common';

@Injectable()
export class FirmamexService {
  services: any;

  firmamexServicesFunc() {
    const FirmamexServices = require('./firmamexSDK');
    if (!process.env.WEB_ID_FIRMAMEX || !process.env.API_KEY_FIRMAMEX) {
      throw new Error('¡Las API keys no están configuradas correctamente!');
    }
    this.services = FirmamexServices(
      process.env.WEB_ID_FIRMAMEX,
      process.env.API_KEY_FIRMAMEX,
    );
    return;
  }

  getServices() {
    if (!this.services) {
      this.firmamexServicesFunc();
      return this.services;
    }
    return this.services;
  }
}
