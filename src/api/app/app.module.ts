import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import { StoreController } from './store/store.controller';
import { MenuController } from './menu/menu.controller';

@Module({
  controllers: [StoreController, MenuController],
  imports: [ServiceModule],
})
export class CoreModule {}
