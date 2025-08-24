/**
 * Bootstrap function to start the Media Service
 */
async function bootstrap(): Promise<void> {
  // TODO: Implement proper app module
  console.log('Media Service starting...');
  const port = process.env.PORT || 3006;
  console.log(`Media Service would run on: http://localhost:${port}`);
}

bootstrap();