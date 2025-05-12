import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerFilterDto } from './create-customer-filter.dto';

export class UpdateCustomerFilterDto extends PartialType(CreateCustomerFilterDto) {}
