/**
 * Bootstrap function to start the Match Service
 */
async function bootstrap(): Promise<void> {
  // TODO: Implement proper app module
  console.log('Match Service starting...');
  const port = process.env.PORT || 3005;
  console.log(`Match Service would run on: http://localhost:${port}`);
}

bootstrap();