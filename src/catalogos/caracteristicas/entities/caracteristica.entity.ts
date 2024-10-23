import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('caracteristicas')
export class Caracteristica {
    
    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        name:'unidad',
        type:'uuid',
        nullable:true,
        default:null
    })
    unidad:string;

    @Column({
        name:'dimension',
        type:'uuid',
        nullable:true,
        default:null
    })
    dimensiones:string;

    @Column({
        name:'impresion',
        type:'uuid',
        nullable:true,
        default:null
    })
    impresion:string;

    @Column({
        name:'formato',
        type:'uuid',
        nullable:true,
        default:null
    })
    formato:string;

    @Column({
        name:'paginas_prensa',
        nullable:true,
        default:null
    })
    paginasPrensa:string;

    @Column({
        name:'seccion_prensa',
        nullable:true,
        default:null
    })
    seccionPrensa:string;

    @Column({
        name:'web_publicacion',
        nullable:true,
        default:null
    })
    webPublicacion:string;

    @Column({
        name:'programa',
        nullable:true,
        default:null
    })
    programa:string;
}
