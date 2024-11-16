import { Controller, Get, Header, StreamableFile } from "@nestjs/common";
import { createReadStream } from "fs";
import { join } from 'path';

@Controller('logs')
export class LoggerController {
    @Get()
    @Header('Content-Type','text/plain')
    @Header('Content-Disposition','attachment; filename="serverLogs.log"')
    getLogsFile(): StreamableFile {
        const file = createReadStream(join(__dirname, '..','..','logs','myLogFile.log'));
        return new StreamableFile(file);
    }

}