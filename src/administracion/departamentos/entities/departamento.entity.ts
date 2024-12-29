import { localeTimeFormatter } from 'src/helpers/localeTimeZoneFormater.function';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('departamentos')
export class Departamento {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({
    length: 50,
    unique: true,
  })
  nombre: string;

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
    this.creadoEn = localeTimeFormatter(value);
    this.actualizadoEn = localeTimeFormatter(value);
  }

  @BeforeUpdate()
  localeTimeZoneUpdate() {
    const value = new Date();
    this.actualizadoEn = localeTimeFormatter(value);
  }
}
