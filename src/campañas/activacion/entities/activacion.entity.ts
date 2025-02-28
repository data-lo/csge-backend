import { tzDate } from '@formkit/tempo';
import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { Partida } from 'src/campañas/partida/entities/partida.entity';
import { formatToLocalTime } from 'src/helpers/format-to-local-time';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('activaciones')
export class Activacion {

  @Generated('uuid')
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    name: 'fecha_de_creacion',
    type: 'date',
    nullable: false,
  })
  fechaDeCreacion: Date;

  @Column({
    name: 'fecha_de_inicio',
    type: 'date',
    nullable: false,
  })
  fechaDeInicio: Date;

  @Column({
    name: 'fecha_de_aprobacion',
    type: 'date',
    nullable: true,
    default: null,
  })
  fechaDeAprobacion: Date;

  @Column({
    name: 'fecha_de_cierre',
    type: 'date',
    nullable: false,
  })
  fechaDeCierre: Date;

  @Column({
    name: 'estatus',
    type: 'boolean',
    default: true,
    nullable: false,
  })
  estatus: boolean;

  @OneToOne(() => Partida, {
    eager: true,
    cascade:true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({name:'partidaId'})
  partida: Partida;

  @ManyToOne(() => Campaña, (campaña) => campaña.activaciones,{
    onDelete:'CASCADE'
  })
  @JoinColumn({name:'campaniaId'})
  campaña: Campaña;

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;

  @BeforeInsert()
  localeTimeZoneInsert() {
    const value = new Date();
    this.creadoEn = formatToLocalTime(value);
    this.actualizadoEn = formatToLocalTime(value);
    this.fechaDeCreacion = formatToLocalTime(this.fechaDeCreacion);
  }

  @BeforeUpdate()
  localeTimeZoneUpdate() {
    const value = new Date();
    this.actualizadoEn = formatToLocalTime(value);
  }

}
