import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { sendUrl } from 'src/modules/request';


@Injectable()
export class AuthService {
  private accessToken: string | null = null; // 액세스 토큰을 저장하기 위한 변수
  private refreshToken: string | null = null; // 액세스 토큰을 저장하기 위한 변수

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
      const response = JSON.parse(re);
      this.accessToken = response.access_token;
      this.refreshToken = response.refresh_token;


      return response;
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

  // 액세스 토큰 반환 메소드
  getStoredAccessToken(): string | null {
    return this.accessToken;
  }

  // 리프레시 토큰 반환 메소드
  getStoredRefreshToken(): string | null {
    return this.refreshToken;
  }
}