import { Column, Entity, Generated, PrimaryColumn } from "typeorm";
import { Territorio } from "../interfaces/territorios";

@Entity('iva')
export class Iva {
    @PrimaryColumn("uuid")
    @Generated("uuid")
    id:string;

    @Column({
        type:'decimal',
        precision:5,
        scale:4,
        nullable:false
    })
    porcentaje:number;

    @Column({
        type:"enum",
        enum:Territorio,
        unique:true
    })
    territorio:Territorio;
}
