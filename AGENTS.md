# AGENTS.md

## Command Convention
- Use only project scripts from `package.json`.
- `bun run biome` for lint checks.
- `bun run tsc` for type checks.
- `bun test` for unit tests.
- `bun run build` for packaging.
- `bun run start` for local serverless run.

## Engineering Principle
- Keep changes small and explicit.
- Prefer shared utilities over duplicate Lambda logic.
- Do not let one stale websocket connection fail a whole broadcast.

## Reliability Rules
- Treat API Gateway websocket `410 GoneException` as a stale connection.
- Delete stale connection ids from DynamoDB instead of retrying them.
- Keep handlers deterministic and return fast after cleanup/logging.
