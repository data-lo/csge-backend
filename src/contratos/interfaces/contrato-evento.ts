import { Contrato } from "../contratos/entities/contrato.entity";

export class ContratoEvent {
    payload:Contrato;
    constructor(
        payload:{contrato:Contrato}
    ){
        this.payload = payload.contrato;
    }
}