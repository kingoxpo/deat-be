import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GetClientInfo } from 'req-useragent';

export const ClientInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const cInfo = GetClientInfo(req);

    return cInfo;
  },
);

export interface IClientInfo {
  ip: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
}
