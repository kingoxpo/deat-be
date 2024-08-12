import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './api/app/app.module';
import * as dotenv from 'dotenv';
import { JwtModule } from './common/jwt/jwt.module';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { MysqlModule } from './libs/mysql/mysql.module';
import configuration from './config/configuration';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true }), // ConfigModule 설정
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: 'deat',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      path: '/graphql',
    }),
    CoreModule,
    JwtModule.forRoot(),
    MysqlModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
