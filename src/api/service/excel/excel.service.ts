import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as csvParser from 'csv-parser';
import { MysqlService } from 'src/libs/mysql/mysql.service';
import * as moment from 'moment';
import 'moment-timezone';
import * as xlsx from 'xlsx';

@Injectable()
export class ExcelService {
  s3: AWS.S3;
  constructor(private db: MysqlService,) {
    // S3 클라이언트 생성
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }
    
  async processS3(file: Express.Multer.File) {
    const bucketName = 's3-ecf';
    const key = `${file.originalname}`; // 여기서 key는 'uploads/' 디렉토리에 업로드된 파일의 원래 이름을 사용합니다.

    // 파일을 S3에 업로드
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer, // 파일 데이터를 포함합니다.
      ContentType: file.mimetype, // 파일의 MIME 타입을 지정합니다.
      ACL: 'public-read',  // 파일이 공개적으로 읽을 수 있도록 설정합니다. 필요에 따라 설정합니다.
    };

    try {
      const data = await this.s3.upload(uploadParams).promise();
      console.log(`File uploaded successfully at ${data.Location}`);
      return data.Location; // 업로드된 파일의 URL 반환
    } catch (error) {
      console.error(`Error uploading file: ${error.message}`);
      throw new Error('Error uploading file to S3');
    }
  }

  async processFile(file: Express.Multer.File) {
    return await this.processS3(file);

    // if (file.mimetype === 'text/csv') {
    //   // CSV 파일 처리
    //   return await this.processCsv(file);
    // } else {
    //   // 엑셀 파일 처리
    //   return await this.processExcel(file);
    // }
  }

  async processCsv(file: Express.Multer.File) {
    const rows = [];
    const bufferStream = new (require('stream').Readable)();
    bufferStream._read = () => {};
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    try {
      // CSV 파일을 메모리에서 읽고 파싱
      await new Promise((resolve, reject) => {
        bufferStream
          .pipe(csvParser())
          .on('data', (row) => {
            rows.push({
              column1: row['Column1'], // CSV 파일의 실제 컬럼명에 맞게 변경
              column2: row['Column2'], // CSV 파일의 실제 컬럼명에 맞게 변경
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // 데이터베이스에 데이터 삽입
      const connection = await this.db.ecf.getConnection();

      try {
        await connection.beginTransaction();

        for (const row of rows) {
          await connection.query(
            `INSERT INTO mem (column1, column2) VALUES (?, ?)`,
            [row['column1'], row['column2']]
          );
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        console.error('데이터 삽입 중 오류 발생:', error);
        throw new InternalServerErrorException('데이터베이스에 데이터를 삽입하는 데 실패했습니다.');
      } finally {
        connection.release();
      }

      console.log('CSV 데이터가 성공적으로 삽입되었습니다.');
      return { message: 'CSV 파일이 처리되고 데이터가 성공적으로 삽입되었습니다.' };
    } catch (error) {
      console.error('CSV 파일 처리 중 오류 발생:', error);
      throw new InternalServerErrorException('CSV 파일을 처리하는 데 실패했습니다.');
    }
  }

  async processExcel(file: Express.Multer.File): Promise<{ message: string }> {
    try {
      // 엑셀 파일을 메모리에서 읽기
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });

      // 첫 번째 시트를 사용 (필요에 따라 특정 시트 이름이나 인덱스를 지정 가능)
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 시트 데이터를 JSON 형태로 변환
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      // 데이터 검증 및 가공
      // const rows = jsonData.slice(1).map((row: any) => ({
      //   order_no: row[0], // 첫 번째 열 데이터
      //   product_name: row[1], // 두 번째 열 데이터
      //   opt_name: row[1], // 두 번째 열 데이터
      //   // 필요한 만큼 열을 추가하세요.
      // }));

      const headers: string[] = jsonData[0] as string[]; // 첫 행을 헤더로 사용
      const rows = jsonData.slice(1).map((row: any[]) => {
        const rowData: any = {};

        // Map each column to its corresponding header
        headers.forEach((header: string, index: number) => {
          rowData[header] = row[index];

          // Convert Excel date to KST
          if (typeof rowData['주문일시'] === 'number') {
            // Calculate JavaScript date from Excel date serial number
            const excelDate = rowData['주문일시'];
            const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
            
            // Adjust for timezone and format the date
            rowData['주문일시'] = moment(jsDate).utc().format('YYYY-MM-DD HH:mm:ss');
          }
        });

        return rowData;
      });

      // 데이터베이스에 데이터 삽입
      const connection = await this.db.ecf.getConnection();

      try {
        await connection.beginTransaction();

        for (const row of rows) {
          const cre = await connection.query(`SELECT
              uniq_cre('${row['주문일시']}','${row['상품구매금액']}','${row['상품품목코드']}', '${row['주문자ID']}') as uniq`)
          await connection.query(
            `INSERT INTO ord (uniq, bundle_no, shop_sale_name, ord_time) VALUES (?, ?, ?, ?)`,
            [cre[0].uniq, row['주문번호'], row['주문상품명'], row['주문일시']]
          );
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        console.error('데이터 삽입 중 오류 발생:', error);
        throw new InternalServerErrorException('데이터베이스에 데이터를 삽입하는 데 실패했습니다.');
      } finally {
        connection.release();
      }

      console.log('Excel 데이터가 성공적으로 삽입되었습니다.');
      return { message: 'Excel 파일이 처리되고 데이터가 성공적으로 삽입되었습니다.' };
    } catch (error) {
      console.error('Excel 파일 처리 중 오류 발생:', error);
      throw new InternalServerErrorException('Excel 파일을 처리하는 데 실패했습니다.');
    }
  }
}
function excelDateToJSDate(excelDate: number): Date {
  // Calculate the date by accounting for Excel's epoch and fractional day
  const millisecondsInDay = 86400 * 1000;
  const jsDate = new Date((excelDate - 25569) * millisecondsInDay);
  jsDate.setUTCHours(jsDate.getUTCHours() + 24); // Adjust for time difference
  return jsDate;
}

