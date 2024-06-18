import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreService } from './store.service';
import { Store, StoreSchema } from './store.schema';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { JwtService } from 'src/common/jwt/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [JwtService, StoreService, UserService],
  exports: [StoreService, UserService],
})
export class ServiceModule {}
