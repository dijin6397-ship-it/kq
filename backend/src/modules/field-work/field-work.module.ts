import { Module } from '@nestjs/common';
import { FieldWorkService } from './field-work.service';
import { FieldWorkController } from './field-work.controller';

@Module({
  controllers: [FieldWorkController],
  providers: [FieldWorkService],
  exports: [FieldWorkService],
})
export class FieldWorkModule {}