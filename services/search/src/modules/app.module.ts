import { Module } from '@nestjs/common';
import { SearchModule } from './search.module';

/**
 * Root application module for Search Service
 * Imports all feature modules and configures the application
 */
@Module({
  imports: [SearchModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
