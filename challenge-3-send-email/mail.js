'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_RECIPIENT = 'hr@ignitershub.com';
const SUBJECT = 'Challenge 3 Completed';

// Allowed attachment types, checked by extension and by file signature so a
// renamed non-image file is rejected.
const IMAGE_TYPES = {
  '.png': {
    mime: 'image/png',
    magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  '.jpg': { mime: 'image/jpeg', magic: [0xff, 0xd8, 0xff] },
  '.jpeg': { mime: 'image/jpeg', magic: [0xff, 0xd8, 0xff] },
};

/** Checks that `filePath` is a real PNG/JPG/JPEG image. Returns its MIME type. */
function validateImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = IMAGE_TYPES[ext];
  if (!type) {
    throw new Error(
      `Attachment must be a PNG, JPG or JPEG image (got "${ext || 'no extension'}").`,
    );
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`Attachment not found: ${filePath}`);
  }
  const fd = fs.openSync(filePath, 'r');
  const header = Buffer.alloc(type.magic.length);
  try {
    fs.readSync(fd, header, 0, header.length, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (!type.magic.every((byte, i) => header[i] === byte)) {
    throw new Error(
      `Attachment content is not a valid ${ext.slice(1).toUpperCase()} image.`,
    );
  }
  return type.mime;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

/**
 * Builds the nodemailer message: subject, plain-text and HTML body with the
 * student details, and the image attachment.
 */
function buildMessage({ from, to, student, attachmentPath }) {
  const required = { name: 'Name', semester: 'Semester', branch: 'Branch', rollNumber: 'Roll number' };
  const missing = Object.entries(required)
    .filter(([key]) => !String(student[key] || '').trim())
    .map(([, label]) => label);
  if (missing.length) {
    throw new Error(`Missing student details: ${missing.join(', ')}`);
  }

  const contentType = validateImage(attachmentPath);
  const rows = [
    ['Name', student.name],
    ['Semester', student.semester],
    ['Branch', student.branch],
    ['Roll Number', student.rollNumber],
  ];

  const text = [
    'Hello,',
    '',
    'I have completed Challenge 3. My details are below:',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'An image is attached to this email.',
    '',
    'Regards,',
    student.name,
  ].join('\n');

  const html = `
<p>Hello,</p>
<p>I have completed Challenge 3. My details are below:</p>
<table cellpadding="4">
${rows.map(([label, value]) => `  <tr><td><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`).join('\n')}
</table>
<p>An image is attached to this email.</p>
<p>Regards,<br>${escapeHtml(student.name)}</p>`.trim();

  return {
    from,
    to,
    subject: SUBJECT,
    text,
    html,
    attachments: [
      {
        filename: path.basename(attachmentPath),
        path: attachmentPath,
        contentType,
      },
    ],
  };
}

module.exports = { buildMessage, validateImage, DEFAULT_RECIPIENT, SUBJECT };
