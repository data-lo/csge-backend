import { Injectable } from '@nestjs/common';
import { FirmamexServices } from './firmamexSDK';

@Injectable()
export class FirmamexService {
    firmamexServices() {
        const services = FirmamexServices(
            process.env.WEB_ID_FIRMAMEX,
            process.env.API_KEY_FIRMAMEX
        );
        return services;
    }
}
