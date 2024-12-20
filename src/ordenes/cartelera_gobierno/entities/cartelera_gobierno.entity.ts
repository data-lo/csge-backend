import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('carteleras_gobierno_estado')
export class CarteleraGobierno {
    
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Generated('increment')
    @Column()
    indice:number;

    @Column({
        name:'ubicacion',
        nullable:false,
        unique:false,
    })
    ubicacion:string;

    @Column({
        name:'numero_de_inventario',
        nullable:true,
        unique: true,
    })
    numeroDeInventario:string;

    @Column({
        name:'clave',
        nullable:false,
    })
    clave:string;

    @Column({
        name:'ruta',
        nullable:false,
    })
    ruta:string;

    @Column({
        name:'medida',
        nullable:false,
    })
    medida:string;

    @Column({
        name:'metros_cuadrados',
        nullable:false,
    })
    metrosCuadrados:string;
}