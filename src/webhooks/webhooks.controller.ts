import { Controller, Post, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) { }

  @Post()
  create(
    @Body() firmamexWebhook: any,
  ) {
    return this.webhooksService.recibirWebHook(firmamexWebhook);
  }
}
