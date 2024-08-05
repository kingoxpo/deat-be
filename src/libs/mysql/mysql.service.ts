// src/mysql/mysql.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class MysqlService implements OnModuleInit, OnModuleDestroy {
  private promisePool: mysql.Pool;

  async onModuleInit() {
    this.promisePool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PW,
      database: 'ecf',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async onModuleDestroy() {
    await this.promisePool.end();
  }

  async query(sql: string, args: any[] = []): Promise<any[]> {
    const connection = await this.promisePool.getConnection();
    let returnData: any[];

    try {
      // MySQL 쿼리 실행 결과를 가져옵니다.
      const [rows] = await connection.query(sql, args);
      returnData = rows as any[];
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    } finally {
      connection.release();
    }

    return returnData || [];
  }
}
