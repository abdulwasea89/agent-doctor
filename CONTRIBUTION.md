# Contributing to agent-doctor

Thank you for your interest in contributing!

## Getting Started

```bash
git clone https://github.com/your-org/agent-doctor
cd agent-doctor
npm install
cd packages/agent-doctor && npm run build
```

## Development Workflow

```bash
# Watch mode (rebuild on change)
cd packages/agent-doctor
npx tsc --watch

# Run on a test project
node dist/cli.js /path/to/test-agent --verbose

# Dogfood on this repo
node dist/cli.js ../.. --verbose
```

## Adding Rules

See [AGENTS.md](./AGENTS.md) for the rule structure. Each rule lives in its own file under `src/rules/<category>/`. After creating the file, add it to `src/rules/index.ts`.

Rule IDs follow the pattern `<CATEGORY>-<NNN>`:
- `SEC-` security (001–018)
- `CFG-` config (001–014)
- `DEP-` deployment (001–013)
- `REL-` reliability (001–014)
- `OBS-` observability (001–012)
- `CMP-` compliance (001–011)

## Pull Request Guidelines

- Keep PRs focused — one rule or feature per PR
- Include a brief description of what the rule detects and why it matters
- Test against at least one real agent project before submitting
- Do not break the public `diagnose()` API signature

## Reporting Issues

Open an issue on GitHub with:
- The command you ran
- The output you got
- The expected output

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
