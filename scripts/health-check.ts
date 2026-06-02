const HEALTH_URL = process.env.HEALTH_URL ?? 'http://localhost:3001/health';

async function main(): Promise<void> {
  const response = await fetch(HEALTH_URL);
  if (!response.ok) {
    process.stderr.write(`Health check failed: ${String(response.status)}\n`);
    process.exit(1);
  }
  process.stdout.write('Health check passed\n');
}

main().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
