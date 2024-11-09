import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('carteleras_gobierno_estado')
export class CarteleraGobierno {
    
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'ubicacion',
        nullable:false,
        unique:true,
    })
    ubicacion:string;

    @Column({
        name:'id_cartelera',
        nullable:true,
        default:null,
    }) 
    idCartelera:string;
}
