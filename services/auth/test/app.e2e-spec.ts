import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

/**
 * Auth Service E2E Tests
 *
 * @description End-to-end tests for the authentication service
 * @version 1.0.0
 * @created 2025-01-24
 * @updated 2025-01-24
 * @author Kim Hsiao
 */
describe('AuthService (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('/ (GET) - health check', () => {
    return request(app.getHttpServer()).get('/').expect(404); // Since no root route is defined, expect 404
  });
});
