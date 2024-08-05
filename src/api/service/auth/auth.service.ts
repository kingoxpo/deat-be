import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { sendUrl } from 'src/modules/request';


@Injectable()
export class AuthService {
  async getCafe24Token(code: string): Promise<any> {
    const clientId = process.env.CAFE24_CLIENT_ID;
    const clientSecret = process.env.CAFE24_CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;
    const mallId = 'ecfincofficial'; // 쇼핑몰 ID
    const header = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    };

    // POST 요청의 payload 생성
    const payload = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    };

    try {
      const re = await sendUrl('POST', `https://${mallId}.cafe24api.com/api/v2/oauth/token`, payload, header);
      return JSON.parse(re);
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
}