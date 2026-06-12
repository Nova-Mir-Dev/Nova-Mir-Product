# Data Retention Policy

## Policy

Data retention period: **90 days**.

## Data Categories and Retention

| Category        | Retention Period     | Justification             |
| --------------- | -------------------- | ------------------------- |
| User accounts   | Last login + 90 days | Service provision         |
| Session data    | 30 days              | Security and debugging    |
| Analytics data  | 90 days              | Product improvement       |
| Email logs      | 90 days              | Deliverability monitoring |
| Billing records | 7 years              | Legal compliance          |
|                 |

## Automated Data Lifecycle

- Daily cron job purges records older than the retention period
- Soft-deletion with 30-day grace period before permanent removal
- Backup retention: 30 days with encrypted snapshots

## Data Subject Deletion Requests

Upon verified request, all personal data is deleted within 30 days. Anonymized analytics aggregates may be retained.
