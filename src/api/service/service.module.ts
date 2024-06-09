import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreService } from './store.service';
import { Store, StoreSchema } from '../schema/store.schema';
import { MenuService } from './menu.service';
import { Menu, MenuSchema } from '../schema/menu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
  ],
  providers: [StoreService, MenuService],
  exports: [StoreService, MenuService],
})
export class ServiceModule {}
