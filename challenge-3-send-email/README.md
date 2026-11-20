# Challenge 3: Send An Email

Sends an email over SMTP using [nodemailer](https://nodemailer.com). The message
carries the student's details and an image attachment.

- **Subject:** `Challenge 3 Completed`
- **Body:** name, semester, branch, and roll number — in both plain text and HTML.
- **Attachment:** one image. The file is checked by **both** its extension and
  its file signature (magic bytes), so only genuine PNG, JPG, or JPEG files are
  accepted — a renamed non-image is rejected.
- **Default recipient:** `hr@ignitershub.com`.

## Setup

```bash
cp challenge-3-send-email/.env.example challenge-3-send-email/.env   # then edit it
```

Fill in `.env` with your SMTP settings and student details. `.env` is
git-ignored, so **your credentials are never committed** — only `.env.example`
(placeholders) is tracked.

For Gmail: turn on 2-Step Verification and create an
[App Password](https://myaccount.google.com/apppasswords); use it as `SMTP_PASS`
(your normal Gmail password will not work).

## Run

```bash
node challenge-3-send-email/index.js --dry-run              # build the email, send nothing
node challenge-3-send-email/index.js --to you@example.com   # test with your own inbox
npm run challenge3                                          # send to MAIL_TO (default hr@)
```

- `--dry-run` builds the full MIME message and saves it as `preview.eml` without
  sending — a safe way to check the output and that the attachment validates.
- `--to <address>` overrides the recipient for testing.
- The program refuses to send while `.env` still holds the example placeholder
  values, so nothing goes out half-configured.

## Configuration (`.env`)

| Key | Meaning |
|-----|---------|
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | SMTP server (defaults: `smtp.gmail.com`, `465`, `true`) |
| `SMTP_USER` / `SMTP_PASS` | SMTP login — for Gmail, `SMTP_PASS` is an **App Password** |
| `MAIL_FROM` / `MAIL_TO` | Sender (defaults to `SMTP_USER`) and recipient |
| `STUDENT_NAME` / `STUDENT_SEMESTER` / `STUDENT_BRANCH` / `STUDENT_ROLL_NUMBER` | Details shown in the email body |
| `ATTACHMENT_PATH` | Image to attach, relative to this folder (default `assets/sample.png`) |

## Files

| File | Role |
|------|------|
| `index.js` | CLI: loads `.env`, builds the message, dry-run or real send |
| `mail.js` | `buildMessage` + `validateImage` (extension + magic-byte check) |
| `.env.example` | Template to copy to `.env` (no real secrets) |
| `assets/sample.png` | Default attachment |

## Tests

Covered by `npm test`: the subject/body/attachment are built correctly, missing
student details are rejected, and non-image or fake-image attachments are
rejected. The tests never send real mail.
