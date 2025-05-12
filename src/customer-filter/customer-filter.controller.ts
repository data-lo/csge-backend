import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { CustomReportService } from './customer-filter.service';
import { CreateQueryDto } from './entities/customer-filter.entity';
import { Response } from "express";
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CUSTOM_REPORT_ROLE } from './custom-report-role';

@Auth(...CUSTOM_REPORT_ROLE)
@Controller('customer-report')
export class CustomReportController {
  constructor(private readonly customReportService: CustomReportService) { }

  @Get('metadata/:module')
  getMetadataByModule(@Param('module') module: string) {
    return this.customReportService.getMetadataByModule(module);
  }

  @Post('build-query')
  buildQuery(@Body() createQueryDto: CreateQueryDto) {
    return this.customReportService.buildQuery(createQueryDto);
  }

  @Post('download-custom-report')
  async downloadExcel(@Body() dto: CreateQueryDto, @Res() res: Response) {
    return this.customReportService.getCustomReport(dto, res);
  }

}
