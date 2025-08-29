import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(registerUserDto: RegisterUserDto, referralCode?: string): Promise<User> {
    if (referralCode) {
      return this.usersService.createWithReferral(registerUserDto, referralCode);
    }
    return this.usersService.create(registerUserDto);
  }

  async getProfile(user: any) {
    const { password, ...result } = await this.usersService.findOne(user.sub);
    return result;
  }

  async refreshToken(user: any) {
    const payload = { email: user.email, sub: user.sub, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(user: any) {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    return {
      message: 'Successfully logged out',
    };
  }
}