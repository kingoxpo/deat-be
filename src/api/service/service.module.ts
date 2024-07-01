import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StoreService } from './store.service';
import { Store, StoreSchema } from './store.schema';
import { UserService } from './user.service';
import { JwtService } from 'src/common/jwt/jwt.service';
import { User, UserSchema } from './user.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [JwtService, StoreService, UserService],
  exports: [StoreService, UserService],
})
export class ServiceModule {}
