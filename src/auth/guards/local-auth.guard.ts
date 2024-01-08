import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Provider } from '../../user/entities/provider.enum';

@Injectable()
export class LocalAuthGuard extends AuthGuard(Provider.LOCAL) {}
