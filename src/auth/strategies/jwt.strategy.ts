import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,

        configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<Usuario> {
        const { id } = payload;
        let usuario: Usuario = await this.cacheManager.get(id);
        if (!usuario) {
            usuario = await this.usuarioRepository.findOneBy({ id });
            if (!usuario) {
                throw new UnauthorizedException('El token no es valido');
            }
            if (!usuario.estatus)
                throw new UnauthorizedException('El usuario se encuentra desactivado');
            await this.cacheManager.set(id, usuario, 1800000);
        }
        return usuario;
    }
}