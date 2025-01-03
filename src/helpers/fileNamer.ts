import { v4 as uuid } from 'uuid'

export const fileNamer = (req:Express.Request,file:Express.Multer.File, callback:Function) => {
    if(!file) return callback(new Error('File is empty'), false );    

    if(!req['fileUuid']){
        req['fileUuid'] = uuid();
    }

    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${req['fileUuid']}.${fileExtension}`
    console.log(fileName);
    callback(null, fileName);
}