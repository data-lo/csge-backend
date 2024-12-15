import { Contrato } from "../contratos/entities/contrato.entity";

export class ContratoEvent {
    contrato:Contrato;
    constructor(
        contrato:Contrato
    ){
        this.contrato = contrato;
    }
}