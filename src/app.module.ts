import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ArticlesModule } from './articles/articles.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, SubscriptionsModule, ArticlesModule, AffiliatesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
