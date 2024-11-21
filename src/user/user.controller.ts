import { Controller, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body('username') username: string, @Body('password') password: string) {
    return this.userService.create(username, password);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.userService.update(id, username, password);
  }
}
