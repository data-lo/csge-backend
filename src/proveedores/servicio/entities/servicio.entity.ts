import { TIPO_DE_SERVICIO } from "src/contratos/interfaces/tipo-de-servicio";
import { Estacion } from "src/proveedores/estacion/entities/estacion.entity";
import { Renovacion } from "src/proveedores/renovacion/entities/renovacion.entity";
import { Column, CreateDateColumn, Entity, Generated, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('servicios')
export class Servicio {

    @Generated('uuid')
    @PrimaryColumn('uuid')
    id: string;

    @Generated('increment')
    @Column()
    indice: number;

    @Column({
        name: 'nombre_de_servicio',
        nullable: false
    })
    nombreDeServicio: string;

    @Column({
        name: 'tipo_de_servicio',
        type: 'enum',
        nullable: false,
        enum: TIPO_DE_SERVICIO
    })
    tipoDeServicio: TIPO_DE_SERVICIO

    @Column({
        name: 'estatus',
        type: 'boolean',
        nullable: false,
        default: true
    })
    estatus: boolean;

    @OneToMany(() => Renovacion, (renovacion) => renovacion.servicio)
    renovaciones: Renovacion[]

    @ManyToOne(() => Estacion, (estacion) => estacion.servicios)
    estacion: Estacion;

    @CreateDateColumn({
        name: 'creado_en'
    })
    creadoEn: Date;

    @UpdateDateColumn({
        name: 'actualizado_en'
    })
    actualizadoEn: Date;
}
