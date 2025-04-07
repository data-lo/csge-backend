import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { CarteleraGobierno } from "src/ordenes/cartelera_gobierno/entities/cartelera_gobierno.entity";
import { Orden } from "src/ordenes/orden/entities/orden.entity";
import { ServiceObject } from "src/ordenes/orden/interfaces/acquired-service";

@Entity('servicios_contratados')
export class ServicioContratado {

    @PrimaryColumn('uuid')
    @Generated('uuid')
    id: string;

    @Column({
        name: 'servicio',
        nullable: false,
        default: {},
        type: 'json'
    })
    servicio: ServiceObject;

    @Column({
        name: 'calendarizacion_del_servicio',
        array: true,
        type: 'date',
        nullable: false,
        default: []
    })
    calendarizacion: Date[];

    @Column({
        name: 'observacion_del_servicio',
        nullable: true,
        default: null,
    })
    observacion: string;

    @Column({
        name: 'cantidad_contratada_del_servicio',
        type: 'numeric',
    })
    cantidad: number;

    @Column({
        name: 'fecha_de_inicio_del_servicio',
        nullable: false,
        type: 'date'
    })
    fechaInicio: Date;

    @Column({
        name: 'fecha_final_del_servicio',
        nullable: false,
        type: 'date'
    })
    fechaFinal: Date;

    @Column({
        name: 'versiones_de_spot',
        type: 'numeric',
        nullable: true,
        default: null
    })
    versionesSpot: number;

    @Column({
        name: 'impactos_por_version_de_spot',
        type: 'numeric',
        nullable: true,
        default: null
    })
    impactosVersionSpot: number;

    @Column({
        name: 'numero_de_dias_de_spot',
        type: 'numeric',
        nullable: true,
        default: null
    })
    numeroDiasSpot: number;

    @ManyToOne(() => CarteleraGobierno, {
        nullable: true,
        deferrable: null
    })
    @JoinColumn()
    cartelera: CarteleraGobierno;

    @ManyToOne(() => Orden, (orden) => orden.serviciosContratados)
    ordenDeServicio: Orden

}
