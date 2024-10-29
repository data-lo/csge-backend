import { Controller, Get} from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}
  
  @Get()
  seed(){
    return this.seedService.seedDb();
  }
  
  @Get('administracion')
  seedAdministracion(){
    return this.seedService.seedAdministracion();
  }

  @Get('catalogos')
  seedCatalogos(){
    return this.seedService.seedCatalogos();
  }

  @Get('configuracion')
  seedConfiguracion(){
    return this.seedService.seedConfiguracion();
  }
  
};
