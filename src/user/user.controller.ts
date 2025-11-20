import { Controller, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(
      createUserDto.username,
      createUserDto.email,
      createUserDto.password
    );
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateUserDto>
  ) {
    return this.userService.update(id, updateData);
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.userService.login(email, password);
  }
}

