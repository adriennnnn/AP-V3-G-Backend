import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  @UsePipes(new ValidationPipe())
  create(@Body() createArticleDto: CreateArticleDto, @Req() req) {
    return this.articlesService.create(createArticleDto, req.user);
  }

  @Get()
  findAll(@Req() req, @Query('search') search?: string, @Query('author') author?: string) {
    return this.articlesService.findAll(req.user, search, author);
  }

  @Get('published')
  findPublished(@Query('search') search?: string, @Query('author') author?: string) {
    return this.articlesService.findPublished(search, author);
  }

  @Get('my-articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  findMyArticles(@Req() req) {
    return this.articlesService.findByAuthor(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.articlesService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto, @Req() req) {
    return this.articlesService.update(id, updateArticleDto, req.user);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  publish(@Param('id') id: string, @Req() req) {
    return this.articlesService.publish(id, req.user);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  unpublish(@Param('id') id: string, @Req() req) {
    return this.articlesService.unpublish(id, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  remove(@Param('id') id: string, @Req() req) {
    return this.articlesService.remove(id, req.user);
  }
}