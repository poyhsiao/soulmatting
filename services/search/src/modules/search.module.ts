import { Module } from '@nestjs/common';
import { SearchController } from '../controllers/search.controller';
import { SearchService } from '../services/search.service';

/**
 * Search module that handles search and discovery functionality
 * Provides search capabilities for users, profiles, and content
 */
@Module({
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
