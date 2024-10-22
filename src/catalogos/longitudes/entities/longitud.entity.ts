import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('longitudes')
export class Longitud {

    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        name:'unidad',
        unique:true
    })
    unidad:string;
}
