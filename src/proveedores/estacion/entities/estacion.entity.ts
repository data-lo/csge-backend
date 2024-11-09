import { Contacto } from "src/proveedores/contacto/entities/contacto.entity";
import { Municipio } from "src/proveedores/municipio/entities/municipio.entity";
import { Proveedor } from "src/proveedores/proveedor/entities/proveedor.entity";
import { Servicio } from "src/proveedores/servicio/entities/servicio.entity";
import { Column, CreateDateColumn, Entity, Generated, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";

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

    @ManyToOne(() => Proveedor, (proveedor) => proveedor.estaciones)
    proveedor:Proveedor

    @ManyToMany(()=> Municipio)
    @JoinTable({name:'estaciones_municipios'})
    municipios: Municipio[];

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;
}
