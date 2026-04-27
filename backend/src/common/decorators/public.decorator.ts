import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Public = () => createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest();
  },
)();