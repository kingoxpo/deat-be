import * as AWS from 'aws-sdk';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { sendUrl } from 'src/modules/request';
import { AuthService } from '../auth/auth.service';
import { MysqlService } from 'src/libs/mysql/mysql.service';
import axios from 'axios';
import * as url from 'url';

@Injectable()
export class ProductService {
  s3: AWS.S3;
  constructor(private readonly authService: AuthService, private db: MysqlService,) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async getCafe24Prod(params: any): Promise<any> {
    const mallId = 'ecfincofficial'; // 쇼핑몰 ID
    const accessToken = this.authService.getStoredAccessToken() || 'aNs2ooSAJl8gajiKBkWycB';

    if (!accessToken) {
      throw new HttpException('Access token is not available', HttpStatus.UNAUTHORIZED);
    }

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Cafe24-Api-Version': '2024-06-01',
    };

    // POST 요청의 payload 생성
    // const payload = {
    //   grant_type: 'authorization_code',
    //   code,
    //   redirect_uri: redirectUri,
    // };
    const paramsJoin = Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');

    try {
      const rows = await sendUrl('GET', `https://${mallId}.cafe24api.com/api/v2/admin/products?${paramsJoin}`, paramsJoin, header);
      const products = JSON.parse(rows).products;

      for (const product  of products) {
        const imageUrls = [
          product.detail_image,
          product.list_image,
          product.tiny_image,
          product.small_image,
        ];
  
        for (const imageUrl of imageUrls) {
          if (imageUrl) {
            const s3Url = await this.uploadImageToS3(imageUrl);
            console.log(`Uploaded image to S3: ${s3Url}`);
          }
        }
      }
 
      return JSON.parse(rows);
    } catch (error) {
      console.error(
        'Failed to fetch access token:',
        error.error || error.message,
      );
      throw new HttpException(
        'Failed to fetch access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadImageToS3(imageUrl: string): Promise<string> {
    try {
      const bucketName = 's3-ecf';
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary');
      const parsedUrl = new URL(imageUrl);
      // 도메인 부분을 제거하고 경로만 사용
      const imagePath = parsedUrl.pathname.split('/').slice(2).join('/');
      const imageKey = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      
      const uploadParams = {
        Bucket: bucketName,
        Key: imageKey,
        Body: imageData,
        ContentType: response.headers['content-type'],
      };

      await this.s3.upload(uploadParams).promise();

      return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
    } catch (error) {
      console.error(`Failed to upload image: ${imageUrl}`, error);
      return null;
    }
  }
}