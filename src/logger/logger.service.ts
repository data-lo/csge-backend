import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises} from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService extends ConsoleLogger {
    
    async logToFile(entry){
        
        const formattedEntry = `${Intl.DateTimeFormat('es-ES',{
            dateStyle:'short',
            timeStyle:'short',
            timeZone:'America/Mexico_City'
        }).format(new Date())}\t${entry}`;

        try{
            if(!fs.existsSync(path.join(__dirname, '..','..','logs'))){
                await fsPromises.mkdir(path.join(__dirname, '..','..','logs'));
            }
            await fsPromises.appendFile(path.join(__dirname, '..','..','logs','myLogFile.log'),formattedEntry)
        
        }catch(error){
            if(error instanceof Error) console.error(error)
        }
    }

    log(message:any, context?: string){
        const entry = `${context}\t${message}\n`
        this.logToFile(entry);
        super.log(message,context);
    }

    error(message:any, stackOrContext:string){
        const entry = `${stackOrContext}\t${message.stringify}\n`
        this.logToFile(entry);
        super.error(message,stackOrContext)
    }
}