import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import { StoreController } from './store/store.controller';
import { MenuController } from './menu/menu.controller';
import { OrderGateway } from './gateway/order.gateway';

@Module({
  controllers: [StoreController, MenuController],
  imports: [ServiceModule],
  providers: [OrderGateway],
})
export class CoreModule {}
