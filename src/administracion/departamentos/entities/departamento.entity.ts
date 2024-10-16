import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('departamentos')
export class Departamento {
    @PrimaryColumn()
    @Generated("uuid")
    id:string;

    @Column({
        length:50,
        unique:true
    })
    nombre:string;
}
