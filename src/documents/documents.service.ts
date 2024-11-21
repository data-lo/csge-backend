import { Injectable } from '@nestjs/common';


@Injectable()
export class DocumentsService {
  create() {
    return 'This action adds a new document';
  }

  findAll() {
    return `This action returns all documents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  update(id: number) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
