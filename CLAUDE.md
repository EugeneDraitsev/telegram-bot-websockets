# CLAUDE.md

## Command Convention
- Use only project scripts from `package.json`.
- `bun run biome` for lint checks.
- `bun run tsc` for type checks.
- `bun test` for unit tests.
- `bun run build` for packaging.
- `bun run start` for local serverless run.

## Engineering Principle
- KISS first.
- Keep behavior explicit and easy to reason about.
- Avoid duplicate logic between lambdas.

## Websocket Reliability
- `410 GoneException` means API Gateway no longer has that connection.
- Remove stale connection ids from `chat-websocket-connections`.
- Do not reject a whole broadcast because one client disconnected.
