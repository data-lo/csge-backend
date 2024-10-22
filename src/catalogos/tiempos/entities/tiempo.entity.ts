import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('tiempos')
export class Tiempo {

    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        name:'unidad',
        unique:true
    })
    unidad:string
}
