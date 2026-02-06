import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  IsUUID,
} from 'class-validator';

export class CreatePaymentDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(['cash', 'bank', 'card'])
  @IsNotEmpty()
  method: string;

  @IsEnum(['invoice', 'expense', 'other'])
  @IsOptional()
  referenceType?: string;

  @IsUUID()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
