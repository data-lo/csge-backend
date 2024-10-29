import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity('contactos')
export class Contacto {
    
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string

    @Column({
       name:'nombre',
       nullable:false,
    })
    nombre:string;

    @Column({
        name:'telefono',
        nullable:true,
        default:null
    })
    telefono:string;

    @Column({
        name:'correo_electronico',
        nullable:true,
        default:null
    })
    correoElectronico:string;

    @Column({
        name:'observaciones',
        nullable:true,
        default:null
    })
    observaciones:string;
}
