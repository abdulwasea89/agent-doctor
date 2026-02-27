import "dotenv/config";

const REQUIRED_ENV = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

function validateEnvironment(): void {
  const required = ["OPENAI_API_KEY"];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

validateEnvironment();
