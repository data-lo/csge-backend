import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
const crypto = require('crypto');

@Injectable()
export class FirmamexService {
    services: any;

    constructor(
        private httpService: HttpService
    ) { }

    firmamexServicesFunc() {
        const FirmamexServices = require('./firmamexSDK');
        this.services = FirmamexServices('DQiImeTdQ68RITaA', 'f8d203d8f305a750ae91258141411541');
    }

    getServices() {
        if (!this.services) {
            this.firmamexServicesFunc();
            return this.services;
        }
        return this.services;
    }


    async sendHttp(documentoBase64, nombreDocumento) {
        const apiKey = 'f8d203d8f305a750ae91258141411541'
        const hmac = crypto.createHmac('sha256', apiKey)
        
        const headers = {
            Authorization: `signmage mBS73C5TdTjthjF0:${hmac}`,
            'Content-Type': 'application/json',
        };

        const data = {

            b64_doc: {
                data: documentoBase64,
                name: nombreDocumento
            },
        }
        const baseUrl = 'https://firmamex.com'
        const response = await this.httpService.post(`${baseUrl}/developers/json`,data,{headers});
        console.log(response);
        return response;
    }
}
