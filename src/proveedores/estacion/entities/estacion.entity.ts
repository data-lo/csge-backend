import { Contacto } from "src/proveedores/contacto/entities/contacto.entity";
import { Municipio } from "src/proveedores/municipio/entities/municipio.entity";
import { Servicio } from "src/proveedores/servicio/entities/servicio.entity";
import { Column, Entity, Generated, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

@Entity('estaciones')
export class Estacion {
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'nombre_estacion',
        nullable:false
    })
    nombre:string;

    @Column({
        name:'estatus',
        type:'boolean',
        nullable:false,
        default:true
    })
    estatus:boolean;

    @OneToMany(() => Contacto, (contacto) => contacto.estacion)
    contactos:Contacto[];

    @OneToMany(() => Servicio, (servicio) => servicio.estacion)
    servicios:Servicio[];

    @ManyToMany(()=> Municipio)
    @JoinTable()
    municipios: Municipio[]
}
