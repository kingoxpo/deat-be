// src/mysql/mysql.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2';
import * as stream from 'stream';

const dbNames = ['ecf'];

class Pool {
  constructor (pool) {
    this.pool = pool;
    this.promisePool = pool.promise();
  }
  private pool: any;
  private promisePool: any;

  // 커넥션에도 쿼리 실행이 있어서 내부 클래스로 반환
  async getConnection() {
    return new Connection(await this.promisePool.getConnection());
  }

  /**
   * Pool 전용
   *
   * @param {*} sql 쿼리
   * @param {*} args 파라미터
   * @param {*} recall 재실행여부
   */
  async query (sql: string, args: any, recall = false): Promise<any> {
    let returnData: any[];
    const conn = await this.promisePool.getConnection();

    try {
      returnData = await conn.query(sql, args);
      conn.release();
    } catch (err) {
      if (
        (err?.code === 'PROTOCOL_CONNECTION_LOST' || err?.message?.includes('connection is in closed state') || err?.message?.includes('The server closed the connection')) &&
        !recall
      ) {
        conn?.destroy();

        return this.query(sql, args, true);
      } else {
        if (!err.message?.includes('/ Query: ')) {
          err.message = `[API] ${err.message} / recall: ${recall} / threadId: ${conn.threadId} / Query: ${mysql.format(sql, args)}`;
        }

        if (err?.code === 'PROTOCOL_CONNECTION_LOST' || err?.message?.includes('connection is in closed state') || err?.message?.includes('The server closed the connection')) {
          conn?.destroy();
        } else {
          conn?.release();
        }

        throw err;
      }
    }

    return returnData?.length ? returnData[0] : [];
  }

  // 스트림용 쿼리
  async queryStream(sql, dataFunc) {
    await new Promise((resolve, reject) => {
      this.pool.getConnection((err, conn) => {
        if (err) {
          reject(err);
        } else {
          conn.query(sql)
            .on('error', (err) => {
              conn.release();
              reject(err);
            })
            .once('end', () => {
              conn.release();
            })
            .stream()
            .pipe(
              new stream.Transform({
                objectMode: true,
                transform: async (row, encoding, callback) => {
                  try {
                    if (row.constructor.name === 'Object' || typeof row.constructor === 'object') {
                      await dataFunc(row);
                    }
                    callback();
                  } catch (err) {
                    conn.release();
                    reject(err);
                  }
                },
              }),
            )
            .on('finish', () => {
              resolve(1);
            });
        }
      });
    });
  }

  // 쿼리 실행시 결과에 필드까지 포함해서 줘서 실행 후 로우만 반환
  // Prepare Statement 쿼리 실행
  async execute (sql: string, args: any) {
    return (await this.promisePool.execute(sql, args))[0];
  }

  /**
   * 커넥션 풀 종료
   */
  end() {
    return this.promisePool.end();
  }
}

class Connection {
  constructor(connection) {
    this.connection = connection;
  }
  private connection: any;

  /**
   * 단일 Connection 전용
   * Transaction 처리로 인해 재연결하면 안됨
   */
  async query(sql: string, args: any) {
    try {
      const returnData = await this.connection.query(sql, args);

      return returnData?.length ? returnData[0] : [];
    } catch (error) {
      error.message = `[API] ${error.message} / threadId: ${this.connection.threadId} / Query: ${mysql.format(sql, args)}`;

      if (error?.code === 'PROTOCOL_CONNECTION_LOST' || error?.message?.includes('connection is in closed state')) {
        this.connection.destroy();
      }
      throw error;
    }
  }

  async beginTransaction () {
    return await this.connection.beginTransaction();
  }

  async commit () {
    await this.connection.commit();
  }

  async rollback () {
    // Can't add new command when connection is in closed state
    // 위의 에러 등으로 인해 커넥션이 이미 닫혀있는경우 rollback 실행시 에러발생되면서 catch 로직에서 에러 발생되어 예외가 정상적으로 캐치되지않음.
    // 이미 종료된 커넥션이기 때문에 롤백은 의미가 없는것으로 판단하여 에러시 처리예외.
    try {
      await this.connection.rollback();
    } catch (err) { /* empty */ }
  }

  release () {
    this.connection.release();
  }

  destroy () {
    this.connection.destroy();
  }
}

@Injectable()
export class MysqlService implements OnModuleInit, OnModuleDestroy {
  private mysqlOption: any;
  public ecf: any;
  private promisePool: mysql.Pool;

  constructor(private readonly config: ConfigService) {
    this.mysqlOption = this.config.get('database');

    this.init();
  }
  

  /**
   * 커넥션 풀 할당
   */
  private async init () {
    await Promise.all(dbNames.map(async name => {
      const poolInstance = new Pool(await this.createPool(name));

      this[name] = poolInstance;
    }));
  }

  async onModuleInit() {
    this.promisePool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PW,
      database: 'ecf',
      waitForConnections: true,
      connectionLimit: 30,
      queueLimit: 0,
    });
  }

  async onModuleDestroy() {
    await this.promisePool.end();
  }

  /**
   * pool 설정 불러오기
   * @param name
   */
  private getConfig(name) {
    if (Object.prototype.hasOwnProperty.call(this.mysqlOption, name)) {
      return this.mysqlOption[name];
    } else {
      throw Error(`wrong database connection name (${name})`);
    }
  }

  /**
   * pool 생성
   * @param name db서버 이름
   */
  private createPool(name: string) {
    return new Promise((resolve) => {
      const config = this.getConfig(name);

      const tryCreatePool = () => {
        console.log(`*** CreatePool ${name} ***`);

        const pool = mysql.createPool(config);

        if (typeof pool === 'undefined') {
          console.error(`pool(${name}) returned undefined, ${JSON.stringify(config)}`);
          setTimeout(() => tryCreatePool(), 3000);
        } else {
          resolve(pool);
        }
      };

      tryCreatePool();
    });
  }
  /**
   * 쿼리 확인
   */
  public format(sql: string, value: any) {
    return mysql.format(sql, value);
  }
  /**
   * 커넥션 풀 종료
   */
  public closePoolConnection(): Promise<void[]> {
    try {
      return Promise.all(dbNames.map(async name => {
        console.log(`*** ClosePool: ${name} ***`);
        await this[name]?.end();
      }));
    } catch (err) {
      console.error(`Close Pool Error: ${err}`);
    }
  }

  // async query(sql: string, args: any[] = []): Promise<any[]> {
  //   const connection = await this.promisePool.getConnection();
  //   let returnData: any[];

  //   try {
  //     // MySQL 쿼리 실행 결과를 가져옵니다.
  //     const [rows] = await connection.query(sql, args);
  //     returnData = rows as any[];
  //   } catch (error) {
  //     console.error('Query error:', error);
  //     throw error;
  //   } finally {
  //     connection.release();
  //   }

  //   return returnData || [];
  // }

}
