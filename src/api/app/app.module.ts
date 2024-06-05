import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import { StoreController } from './store/store.controller';

@Module({
  controllers: [StoreController],
  imports: [ServiceModule],
})
export class CoreModule {}
