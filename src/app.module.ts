import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './api/app/app.module';
import * as dotenv from 'dotenv';
import { JwtModule } from './common/jwt/jwt.module';
import { ConfigModule } from '@nestjs/config';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ConfigModule 설정
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: 'deat',
    }),
    CoreModule,
    JwtModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
