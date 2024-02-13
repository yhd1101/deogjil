import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export const Info = {
  statusCode: 200,
  message: 'success',
  meta: null,
};

export type Response<T> = typeof Info & {
  data: T;
};

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'data' in data) {
          // data 속성이 객체이고 내부에 data 속성이 있는 경우
          return {
            ...Info,
            data: data.data,
            meta: data.meta || null,
          } as Response<T>;
        } else {
          // 그 외의 경우
          return { ...Info, data } as Response<T>;
        }
      }),
    );
  }
}
