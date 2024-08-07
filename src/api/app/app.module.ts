import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import { StoreController } from './store/store.controller';
import { UserController } from './user/user.controller';
import { UserResolver } from './user/user.resolver';
import { AuthController } from './auth/auth.controller';

@Module({
  controllers: [UserController, StoreController, AuthController],
  imports: [ServiceModule],
  providers: [UserResolver],
})
export class CoreModule {}
