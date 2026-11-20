#!/usr/bin/env node
'use strict';

/*
 * Challenge 3 - Send An Email
 *
 * Usage:
 *   node index.js                       send to MAIL_TO (default hr@ignitershub.com)
 *   node index.js --to you@example.com  send to your own address while testing
 *   node index.js --dry-run             build the email and save it as
 *                                       preview.eml without sending anything
 *
 * Settings are read from the .env file in this folder (copy .env.example).
 */

const fs = require('node:fs');
const path = require('node:path');
const nodemailer = require('nodemailer');
const { buildMessage, DEFAULT_RECIPIENT } = require('./mail');

function parseArgs(argv) {
  const options = { to: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') options.dryRun = true;
    else if (argv[i] === '--to') options.to = argv[++i];
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  if (options.to === undefined) throw new Error('--to needs an email address');
  return options;
}

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) process.loadEnvFile(envPath);
}

// Values shipped in .env.example. Sending with them can only fail.
const PLACEHOLDERS = {
  SMTP_USER: 'your.email@gmail.com',
  SMTP_PASS: 'your-16-char-app-password',
  STUDENT_NAME: 'Your Name',
  STUDENT_ROLL_NUMBER: '1234567',
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`${name} is not set. Add it to challenge-3-send-email/.env`);
  }
  return value.trim();
}

function rejectPlaceholders() {
  const unchanged = Object.entries(PLACEHOLDERS)
    .filter(([name, placeholder]) => (process.env[name] || '').trim() === placeholder)
    .map(([name]) => name);
  if (unchanged.length) {
    throw new Error(
      `challenge-3-send-email/.env still has example values for: ${unchanged.join(', ')}. ` +
        'Replace them with your real details (SMTP_PASS must be a Gmail App Password).',
    );
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  loadEnv();

  const from = options.dryRun
    ? process.env.MAIL_FROM || process.env.SMTP_USER || 'sender@example.com'
    : process.env.MAIL_FROM || requireEnv('SMTP_USER');
  const to = options.to || process.env.MAIL_TO || DEFAULT_RECIPIENT;

  const attachment = process.env.ATTACHMENT_PATH || 'assets/sample.png';
  const message = buildMessage({
    from,
    to,
    student: {
      name: process.env.STUDENT_NAME,
      semester: process.env.STUDENT_SEMESTER,
      branch: process.env.STUDENT_BRANCH,
      rollNumber: process.env.STUDENT_ROLL_NUMBER,
    },
    attachmentPath: path.resolve(__dirname, attachment),
  });

  if (options.dryRun) {
    const transporter = nodemailer.createTransport({ streamTransport: true, buffer: true });
    const info = await transporter.sendMail(message);
    const previewPath = path.join(__dirname, 'preview.eml');
    fs.writeFileSync(previewPath, info.message);
    console.log(`Dry run: nothing was sent. Email for ${to} saved to ${previewPath}`);
    return;
  }

  rejectPlaceholders();
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user: requireEnv('SMTP_USER'), pass: requireEnv('SMTP_PASS') },
  });

  await transporter.verify();
  const info = await transporter.sendMail(message);
  console.log(`Email sent to ${to} (message id ${info.messageId}).`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
