import { Injectable } from "@nestjs/common";
import { ActivacionService } from './activacion.service';

@Injectable()
export class ActivacionEventosService {

    constructor(
        private activacionService:ActivacionService
    ){}

}