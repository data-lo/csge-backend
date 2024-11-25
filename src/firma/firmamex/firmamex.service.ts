import { Injectable } from '@nestjs/common';
import { FirmamexServices } from './firmamexSDK';

@Injectable()
export class FirmamexService {
    firmamexServices() {
        const services = FirmamexServices(
            process.env.WEB_ID,
            process.env.API_KEY
        );
        return services;
    }
}
