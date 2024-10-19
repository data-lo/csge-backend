import { Column, Entity, Generated, PrimaryColumn } from "typeorm";
import { CamposDeTexto } from "../interfaces/textos.campos";

@Entity('textos_de_impresion')
export class Texto {
    @PrimaryColumn("uuid")
    @Generated("uuid")
    id:string;

    @Column({
        nullable:false
    })
    texto:string;

    @Column({
        type:"enum",
        enum:CamposDeTexto,
        unique:true
    })
    campo:CamposDeTexto;
}
