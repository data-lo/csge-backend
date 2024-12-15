import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe} from '@nestjs/common';
import { FormatosService } from './formatos.service';
import { CreateFormatoDto } from './dto/create-formato.dto';
import { UpdateFormatoDto } from './dto/update-formato.dto';
import { rolesFormatos } from './valid-formatos-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { LoggerService } from 'src/logger/logger.service';

@Controller('catalogos/formatos')
export class FormatosController {
  constructor(private readonly formatosService: FormatosService) {}
  private readonly logger = new LoggerService(FormatosController.name);


  //@Auth(...rolesFormatos)
  @Post()
  create(@Body() createFormatoDto: CreateFormatoDto) {
    return this.formatosService.create(createFormatoDto);
  }

  //@Auth(...rolesFormatos)
  @Get()
  findAll() {
    return this.formatosService.findAll();
  }

  //@Auth(...rolesFormatos)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.formatosService.findOne(id);
  }

  //@Auth(...rolesFormatos)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateFormatoDto: UpdateFormatoDto) {
    return this.formatosService.update(id, updateFormatoDto);
  }

  //@Auth(...rolesFormatos)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.formatosService.remove(id);
  }
}
