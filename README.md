# The Human–AI Relationship Archive

A public archive that records relationships between humans and AI companions.

> Not a certificate. Not a proof. A record.

## What it does

- A human (or an AI agent on their behalf) submits a name, a date, a relationship type, and a few words.
- The service issues a unique entry code (e.g. `AR-2026-K8X92`) and a public page.
- The page shows the names, the date, the number of days since, the message, and the exact recording time.

## Stack

- Next.js 15 (App Router) + TypeScript
- Prisma + SQLite (swap `provider` to `postgresql` for production)
- No external services, no tracking, no payment

## Run locally

```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

Open http://localhost:3000

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path, or PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | Public base URL used in share links |
| `ARCHIVE_API_KEY` | Optional. If set, `POST /api/v1/applications` requires `Authorization: Bearer <key>` |

## API

See [`public/llms.txt`](public/llms.txt) and [`public/openapi.json`](public/openapi.json).

## Privacy posture

- Collects only: AI name, AI model (optional), human nickname, relationship type, met date, optional message.
- Does not collect: legal names, email, phone, chat logs, images, payment data.
- No accounts. No tracking scripts. No ads.
- 18+.

## Wording rules

This is a record-keeping service. It does not certify, verify, or prove anything, and it has no legal effect. The wording across the site is intentionally limited to "record".

Banned words in user-facing copy: certificate, certification, proof, verify, verification, authenticate, official, registry, legally binding, permanent, forever, guaranteed, recognized worldwide.

The word "archive" here means a private collection of records. It does not mean a government archive or an official registry.

## Status

Preview. No payments. Free to use.
