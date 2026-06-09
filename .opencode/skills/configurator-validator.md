---
name: configurator-validator
description: Validates the current configuration against engineering constraints. Use when checking config compatibility.
---

# Configurator Validator

Ensures the project configuration is internally consistent and production-ready.

## Usage (CLI Script)

```bash
npx tsx scripts/validate-config.ts --config .tmp/config.json
cat .tmp/config.json | npx tsx scripts/validate-config.ts --stdin
npx tsx scripts/validate-config.ts --config .tmp/config.json --json
```

## When to Invoke the Agent

Only invoke agent reasoning when:
- A constraint violation needs contextual explanation
- Multiple constraints interact and a tradeoff decision is needed
- The user needs a recommendation, not just a violation list
