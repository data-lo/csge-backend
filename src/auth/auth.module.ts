import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule} from '@nestjs/passport';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  providers:[JwtStrategy],
  imports:[
    TypeOrmModule.forFeature([Usuario]),
    PassportModule.register({defaultStrategy:'jwt'}),
  ],
  exports:[JwtStrategy,PassportModule]
})
export class AuthModule {}
