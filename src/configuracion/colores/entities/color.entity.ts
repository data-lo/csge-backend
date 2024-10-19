import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('paleta_colores')
export class Color {
    @PrimaryColumn("uuid")
    @Generated("uuid")
    id:string;

    @Column({
        length:8,
        unique:true
    })
    color:string;

    @Column({
        default:false
    })
    primario:boolean
}
