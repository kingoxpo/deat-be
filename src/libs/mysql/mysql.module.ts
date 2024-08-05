import { DynamicModule, Global, Module } from '@nestjs/common';
import { IMySqlOptions } from './mysql.interface';
import { MysqlService } from './mysql.service';

@Module({})
@Global()
export class MysqlModule {
  static forRoot(options?: IMySqlOptions): DynamicModule {
    return {
      module: MysqlModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        MysqlService,
      ],
      exports: [MysqlService],
    };
  }
}
