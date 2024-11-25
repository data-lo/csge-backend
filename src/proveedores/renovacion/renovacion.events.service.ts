import { Injectable } from "@nestjs/common";
import { RenovacionService } from "./renovacion.service";
import { OnEvent } from "@nestjs/event-emitter";
import { ProveedorEvent } from "../proveedor/interfaces/proveedor-evento";

@Injectable()
export class RenovacionEventosService {
    
}