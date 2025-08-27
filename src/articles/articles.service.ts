import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto, author: User): Promise<Article> {
    const newArticle = this.articlesRepository.create({ ...createArticleDto, author });
    return this.articlesRepository.save(newArticle);
  }

  async findAll(user?: User, search?: string, author?: string): Promise<Article[]> {
    const queryBuilder = this.articlesRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');

    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.AUTHOR || user.role === UserRole.MANAGER)) {
      // Admins, authors, and managers can see all articles
    } else {
      // Regular users can only see published articles
      queryBuilder.where('article.published = :published', { published: true });
    }

    if (search) {
      queryBuilder.andWhere('(article.title ILIKE :search OR article.content ILIKE :search)', {
        search: `%${search}%`
      });
    }

    if (author) {
      queryBuilder.andWhere('author.username ILIKE :author', { author: `%${author}%` });
    }

    return queryBuilder.getMany();
  }

  async findPublished(search?: string, author?: string): Promise<Article[]> {
    const queryBuilder = this.articlesRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where('article.published = :published', { published: true });

    if (search) {
      queryBuilder.andWhere('(article.title ILIKE :search OR article.content ILIKE :search)', {
        search: `%${search}%`
      });
    }

    if (author) {
      queryBuilder.andWhere('author.username ILIKE :author', { author: `%${author}%` });
    }

    return queryBuilder.getMany();
  }

  async findByAuthor(authorId: string): Promise<Article[]> {
    return this.articlesRepository.find({
      where: { author: { id: authorId } },
      relations: ['author']
    });
  }

  async findOne(id: string, user?: User): Promise<Article> {
    const article = await this.articlesRepository.findOne({ where: { id }, relations: ['author'] });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    if (!article.published && (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.AUTHOR && user.role !== UserRole.MANAGER))) {
      throw new UnauthorizedException('You are not authorized to view this article');
    }
    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, user: User): Promise<Article> {
    const article = await this.findOne(id, user);

    if (user.role === UserRole.AUTHOR && article.author.id !== user.id) {
      throw new UnauthorizedException('You are not authorized to update this article');
    }

    Object.assign(article, updateArticleDto);
    return this.articlesRepository.save(article);
  }

  async publish(id: string, user: User): Promise<Article> {
    const article = await this.findOne(id, user);

    if (user.role === UserRole.AUTHOR && article.author.id !== user.id) {
      throw new UnauthorizedException('You are not authorized to publish this article');
    }

    article.published = true;
    return this.articlesRepository.save(article);
  }

  async unpublish(id: string, user: User): Promise<Article> {
    const article = await this.findOne(id, user);

    if (user.role === UserRole.AUTHOR && article.author.id !== user.id) {
      throw new UnauthorizedException('You are not authorized to unpublish this article');
    }

    article.published = false;
    return this.articlesRepository.save(article);
  }

  async remove(id: string, user: User): Promise<void> {
    const article = await this.findOne(id, user);

    if (user.role === UserRole.AUTHOR && article.author.id !== user.id) {
      throw new UnauthorizedException('You are not authorized to delete this article');
    }

    const result = await this.articlesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }
}