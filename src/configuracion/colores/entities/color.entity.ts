import { Column, Generated, PrimaryColumn } from "typeorm";

export class Color {
    @PrimaryColumn()
    @Generated("uuid")
    id:string

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
