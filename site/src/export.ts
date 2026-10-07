import { CERTIFICATE_COURSE, ISSUER } from './catalog';

type Credential = {
  id: string;
  title?: string;
  course?: string;
  issuedAt?: string;
  recipient?: { githubId?: number; githubLogin?: string; name?: string };
  issuer?: { name?: string };
};

function saveBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

export async function downloadUrl(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('The file could not be downloaded.');
  saveBlob(await response.blob(), filename);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export async function certificateCanvas(credential: Credential) {
  const width = 1600;
  const height = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot draw the certificate.');

  const base = import.meta.env.BASE_URL;
  const [art, logo] = await Promise.all([
    loadImage(`${base}badges/certificate-side.webp`),
    loadImage(`${base}rm-logo.png`),
  ]);

  ctx.fillStyle = '#091f2c';
  ctx.fillRect(0, 0, width, height);

  if (art) ctx.drawImage(art, 980, 0, 620, height);

  const fade = ctx.createLinearGradient(900, 0, 1100, 0);
  fade.addColorStop(0, '#091f2c');
  fade.addColorStop(1, 'rgba(9, 31, 44, 0)');
  ctx.fillStyle = fade;
  ctx.fillRect(900, 0, 200, height);

  if (logo) ctx.drawImage(logo, 72, 56, 56, 56);

  ctx.fillStyle = '#c58cff';
  ctx.font = '600 22px sans-serif';
  ctx.fillText('Certificate of completion', 72, 150);

  ctx.fillStyle = '#f3f7ff';
  ctx.font = '700 48px sans-serif';
  const course = credential.course || CERTIFICATE_COURSE;
  let y = 220;
  for (const line of wrap(ctx, course, 860)) {
    ctx.fillText(line, 72, y);
    y += 58;
  }

  ctx.fillStyle = '#b4c3d6';
  ctx.font = '500 20px sans-serif';
  ctx.fillText('Presented to', 72, y + 28);

  ctx.fillStyle = '#f3f7ff';
  ctx.font = 'italic 56px Georgia, "Times New Roman", serif';
  ctx.fillText(credential.recipient?.name || credential.recipient?.githubLogin || '', 72, y + 100);

  const facts = [
    ['GitHub account', `@${credential.recipient?.githubLogin || ''} · ${credential.recipient?.githubId ?? ''}`],
    ['Completed', credential.issuedAt
      ? new Date(credential.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      : ''],
    ['Credential ID', credential.id],
    ['Issuer', `${credential.issuer?.name || ISSUER}, course creator`],
  ];
  y += 170;
  for (const [label, value] of facts) {
    ctx.fillStyle = '#b4c3d6';
    ctx.font = '500 18px sans-serif';
    ctx.fillText(label, 72, y);
    ctx.fillStyle = '#f3f7ff';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(value, 280, y);
    y += 40;
  }

  ctx.fillStyle = '#b4c3d6';
  ctx.font = '16px sans-serif';
  ctx.fillText('Checked against public GitHub repositories. This is not a GitHub certification.', 72, 940);

  return canvas;
}

export async function downloadCertificateImage(credential: Credential) {
  const canvas = await certificateCanvas(credential);
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('The certificate image could not be created.'));
        return;
      }
      saveBlob(blob, `${credential.id}-certificate.png`);
      resolve();
    }, 'image/png');
  });
}

function bytesOf(text: string) {
  return new TextEncoder().encode(text);
}

function pdfFromJpeg(jpeg: Uint8Array, imgW: number, imgH: number) {
  const pageW = 842;
  const pageH = 595;
  const scale = Math.min(pageW / imgW, pageH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  const x = (pageW - w) / 2;
  const y = (pageH - h) / 2;
  const objects: Uint8Array[] = [];
  const add = (body: string | Uint8Array) => {
    objects.push(typeof body === 'string' ? bytesOf(body) : body);
  };
  add('<< /Type /Catalog /Pages 2 0 R >>\n');
  add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n');
  add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\n`);
  const content = `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q\n`;
  add(`<< /Length ${bytesOf(content).length} >>\nstream\n${content}endstream\n`);
  const imageHeader = `<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`;
  add(concatBytes([bytesOf(imageHeader), jpeg, bytesOf('\nendstream\n')]));

  const header = bytesOf('%PDF-1.4\n');
  const chunks = [header];
  const offsets = [0];
  let cursor = header.length;
  objects.forEach((object, index) => {
    const wrapped = concatBytes([bytesOf(`${index + 1} 0 obj\n`), object, bytesOf('endobj\n')]);
    offsets.push(cursor);
    chunks.push(wrapped);
    cursor += wrapped.length;
  });
  const xrefStart = cursor;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return concatBytes([...chunks, bytesOf(xref), bytesOf(trailer)]);
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export async function downloadCertificatePdf(credential: Credential) {
  const canvas = await certificateCanvas(credential);
  const jpeg = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('The certificate PDF could not be created.'));
      else resolve(blob);
    }, 'image/jpeg', 0.92);
  });
  const bytes = new Uint8Array(await jpeg.arrayBuffer());
  const pdf = pdfFromJpeg(bytes, canvas.width, canvas.height);
  saveBlob(new Blob([pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength)], { type: 'application/pdf' }), `${credential.id}-certificate.pdf`);
}
