import { Estacion } from 'src/proveedores/estacion/entities/estacion.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { Column, CreateDateColumn, Entity, Generated, ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('contactos')
export class Contacto {

    @Generated('uuid')
    @PrimaryColumn('uuid')
    id: string

    @Column({
        name: 'nombre',
        nullable: false,
    })
    nombreContacto: string;

    @Column({
        name: 'telefono',
        nullable: true,
        default: null
    })
    telefono: string;

    @Column({
        name: 'correo_electronico',
        nullable: true,
        default: null
    })
    correoElectronico: string;

    @Column({
        name: 'observaciones',
        nullable: true,
        default: null
    })
    observaciones: string;

    @ManyToOne(() => Estacion, (estacion) => estacion.contactos)
    estacion: Estacion;

    @ManyToOne(() => Proveedor, (proveedor) => proveedor.contactos)
    proveedor: Proveedor;

    @CreateDateColumn({
        name: 'creado_en'
    })
    creadoEn: Date;

    @UpdateDateColumn({
        name: 'actualizado_en'
    })
    actualizadoEn: Date;
}
