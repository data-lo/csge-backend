import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) { }

  @Post()
  create(@Body() data: any, @Req() request: Request) {
    return this.webhooksService.receiveWebHook(data);
  }


  @Get()
  get() {
    return {
      message: 'Política Digital.',
    };
  }
}
