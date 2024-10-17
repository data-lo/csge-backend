import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('puestos')
export class Puesto {
    @PrimaryColumn("uuid")
    @Generated("uuid")
    id:string

    @Column({
        length:50,
        unique:true
    })
    nombre:string
}
