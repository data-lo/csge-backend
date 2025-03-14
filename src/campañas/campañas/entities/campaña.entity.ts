import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CAMPAIGN_STATUS } from '../interfaces/estatus-campaña.enum';
import { Dependencia } from 'src/campañas/dependencia/entities/dependencia.entity';
import { Activacion } from 'src/campañas/activacion/entities/activacion.entity';
import { TipoCampaña } from '../interfaces/tipo-campaña.enum';
import { formatToLocalTime } from 'src/helpers/format-to-local-time';

@Entity('campanias')
export class Campaña {
  @Generated('uuid')
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    name: 'nombre',
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'estatus',
    nullable: false,
    default: CAMPAIGN_STATUS.CREADA,
    type: 'enum',
    enum: CAMPAIGN_STATUS,
  })
  estatus: CAMPAIGN_STATUS;

  @Column({
    name: 'tipo_de_campania',
    nullable: false,
    type: 'enum',
    enum: TipoCampaña,
  })
  tipoDeCampaña: TipoCampaña;

  @ManyToMany(() => Dependencia)
  @JoinTable({ name: 'campanias_dependencias' })
  dependencias: Dependencia[];

  @OneToMany(() => Activacion, (activacion) => activacion.campaña, {
    cascade:true,
    onDelete: 'CASCADE',
  })
  activaciones: Activacion[];

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;

  //@BeforeInsert()
  //localeTimeZoneInsert() {
  //  const value = new Date();
  //  this.creadoEn = formatToLocalTime(value);
  //  this.actualizadoEn = formatToLocalTime(value);
  //}

  //@BeforeUpdate()
  //localeTimeZoneUpdate() {
  //  const value = new Date();
  //  this.actualizadoEn = formatToLocalTime(value);
  //}
}
