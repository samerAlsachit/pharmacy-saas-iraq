import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return { accessToken: token, user: { id: user.id, username: user.username, role: user.role } };
  }

  async register(username: string, password: string, role: string = 'ASSISTANT') {
    const hash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { username, password: hash, role: role as any },
    });
  }
}
