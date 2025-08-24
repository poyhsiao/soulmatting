import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { SearchResultDto } from '../dto/search-result.dto';

/**
 * Search controller that handles search and discovery endpoints
 * Provides REST API for searching users, profiles, and content
 */
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Search for users and profiles
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @param offset - Number of results to skip
   * @returns Promise<SearchResultDto[]>
   */
  @Get()
  @ApiOperation({ summary: 'Search for users and profiles' })
  @ApiQuery({ name: 'query', description: 'Search query string' })
  @ApiQuery({ name: 'limit', description: 'Maximum number of results', required: false })
  @ApiQuery({ name: 'offset', description: 'Number of results to skip', required: false })
  @ApiResponse({ status: 200, description: 'Search results', type: [SearchResultDto] })
  async search(
    @Query('query') query: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SearchResultDto[]> {
    return this.searchService.search(query, limit, offset);
  }

  /**
   * Get search suggestions based on partial query
   * @param query - Partial search query
   * @returns Promise<string[]>
   */
  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiQuery({ name: 'query', description: 'Partial search query' })
  @ApiResponse({ status: 200, description: 'Search suggestions', type: [String] })
  async getSuggestions(@Query('query') query: string): Promise<string[]> {
    return this.searchService.getSuggestions(query);
  }
}