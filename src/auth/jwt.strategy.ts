import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '1234',
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }
      return {
        id: payload.sub,
        username: payload.username,
        email: payload.email
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
