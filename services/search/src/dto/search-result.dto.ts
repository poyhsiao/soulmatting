import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for search results
 * Represents a single search result item
 */
export class SearchResultDto {
  /**
   * Unique identifier of the search result
   */
  @ApiProperty({ description: 'Unique identifier of the search result' })
  @IsString()
  id: string;

  /**
   * Type of the search result (user, profile, content, etc.)
   */
  @ApiProperty({ description: 'Type of the search result', example: 'user' })
  @IsString()
  type: string;

  /**
   * Title or name of the search result
   */
  @ApiProperty({ description: 'Title or name of the search result' })
  @IsString()
  title: string;

  /**
   * Description or summary of the search result
   */
  @ApiProperty({ description: 'Description or summary of the search result' })
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Search relevance score
   */
  @ApiProperty({ description: 'Search relevance score', example: 1.0 })
  @IsNumber()
  score: number;

  /**
   * Additional metadata for the search result
   */
  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
