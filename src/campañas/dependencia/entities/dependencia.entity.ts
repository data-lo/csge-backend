import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('dependencia')
export class Dependencia {
    
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'nombre_dependencia',
        nullable:false
    })
    nombre:string;
}
