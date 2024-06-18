import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Algorithm } from 'jsonwebtoken';

const algorithm: Algorithm = 'HS512';
const expiresIn: number | string = '1d';

const JWTCONFIG = {
  option: {
    algorithm,
    expiresIn,
  },
};

@Injectable()
export class JwtService {
  constructor(private readonly config: ConfigService) {}

  /**
   * 토큰 유효성 검사
   */
  async auth(headers) {
    const authHeader = headers.authorization;
    let token = '';

    // extract token from http headers
    if (authHeader) {
      const parts = authHeader.split(' ');

      if (parts.length === 2 && parts[0].toLowerCase() === 'token') {
        token = parts[1];
      }
    }

    if (!token) {
      throw {
        error_code: 401,
        messages: [
          '헤더에 인증토큰이 누락되었습니다. Authorization 값을 확인해주십시오.',
        ],
      };
    }

    const userInfo = {
      ...(await this.verify(token)),
      token: `Token ${token}`,
    };

    return userInfo;
  }

  async sign(data: any): Promise<string> {
    const payload = { ...data };
    const token = jwt.sign(
      payload,
      this.config.get<string>('JWT_SECRET'),
      JWTCONFIG.option,
    );
    return token;
  }

  async verify(token: string): Promise<any> {
    try {
      const decodeData = jwt.verify(token, this.config.get('JWT_SECRET'));
      const a = JSON.stringify(decodeData);
      const b = JSON.parse(a);

      return b;
    } catch (e) {
      // throw e;
      throw {
        error_code: 'e1998',
        messages: [
          e?.message === 'jwt expired'
            ? '토큰의 유효기간이 만료되었습니다. 토큰을 재발행 해 주십시오.'
            : '인증토큰 정보가 올바르지 않습니다. 토큰을 재발행 해 주십시오.',
        ],
        status: 403,
        notify: 'alert',
      };
    }
  }

  /**
   * 토큰생성
   */
  async generateToken(data, options): Promise<string> {
    options = options || {};

    if (!options.algorithm) {
      options.algorithm = JWTCONFIG.option.algorithm;
    }

    const token = jwt.sign({ ...data }, this.config.get('JWT_SECRET'), options);

    return token;
  }
}
