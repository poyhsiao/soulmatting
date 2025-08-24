import { Module } from '@nestjs/common';
import { CommunicationModule } from './communication.module';

/**
 * Root application module for Communication Service
 * Imports all feature modules and configures the application
 */
@Module({
  imports: [CommunicationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}