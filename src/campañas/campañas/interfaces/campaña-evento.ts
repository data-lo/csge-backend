import { Campaña } from "../entities/campaña.entity";

export class CampaniaEvent {
    payload:Campaña
    constructor(
        payload:{campaña:Campaña}
    ){
        this.payload = payload.campaña
    }
}