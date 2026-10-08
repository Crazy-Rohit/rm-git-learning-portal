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

export async function personalizeBadge(slug: string, name: string) {
  const { badgeImageSrc, nameLines, plaqueFromCss } = await import('./badge');
  const image = await loadImage(badgeImageSrc(slug));
  if (!image) throw new Error('The badge image could not be loaded.');
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot draw the badge.');
  ctx.drawImage(image, 0, 0);

  const plaque = plaqueFromCss(slug);
  const lines = nameLines(name.replace(/\s+/g, ' ').trim() || 'Learner');
  const width = canvas.width;
  const height = canvas.height;
  const plaqueH = height * plaque.height;
  const midY = height * plaque.top + plaqueH / 2;
  let fontSize = width * ((plaque.font || 5.0) / 100);
  const typeface = '"Segoe UI Variable Display", "Segoe UI", "Avenir Next", "Gill Sans", sans-serif';
  ctx.font = `800 ${Math.round(fontSize)}px ${typeface}`;
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ('letterSpacing' in spaced) spaced.letterSpacing = `${Math.max(0.4, width * 0.0008)}px`;
  const maxText = width * plaque.maxWidth * 0.88;
  const widest = () => Math.max(...lines.map((line) => ctx.measureText(line).width));
  const stackH = () => fontSize * (lines.length === 1 ? 1 : 2.15);
  while (fontSize > 7 && (widest() > maxText || stackH() > plaqueH * 0.92)) {
    fontSize -= 0.4;
    ctx.font = `800 ${Math.round(fontSize)}px ${typeface}`;
  }

  const textW = Math.min(maxText, widest());
  const gradient = ctx.createLinearGradient(width / 2 - textW / 2, midY, width / 2 + textW / 2, midY);
  gradient.addColorStop(0, plaque.from || plaque.color || '#ffffff');
  if (plaque.mid) gradient.addColorStop(0.5, plaque.mid);
  gradient.addColorStop(1, plaque.to || plaque.color || '#ffffff');

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = plaque.glow || 'transparent';
  ctx.shadowBlur = Math.max(2, width * 0.005);
  ctx.fillStyle = gradient;
  const gap = fontSize * 1.08;
  const startY = lines.length === 1 ? midY : midY - gap / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * gap);
  });
  return canvas;
}

export async function downloadBadgeImage(slug: string, name: string, filename: string) {
  const canvas = await personalizeBadge(slug, name);
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('The badge image could not be created.'));
        return;
      }
      saveBlob(blob, filename);
      resolve();
    }, 'image/png');
  });
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
  const base = import.meta.env.BASE_URL;
  const art = await loadImage(`${base}badges/certificate-empty.webp`);
  const width = art?.naturalWidth || 1414;
  const height = art?.naturalHeight || 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot draw the certificate.');

  if (art) ctx.drawImage(art, 0, 0, width, height);
  else {
    ctx.fillStyle = '#09101c';
    ctx.fillRect(0, 0, width, height);
  }

  const name = credential.recipient?.name || credential.recipient?.githubLogin || 'Learner';
  const login = credential.recipient?.githubLogin ? `@${credential.recipient.githubLogin}` : '';
  const { nameLines } = await import('./badge');
  const lines = nameLines(name);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const maxName = width * 0.62;
  const boxH = height * 0.135;
  let fontSize = height * 0.084;
  const typeface = '"Segoe UI", "Noto Sans", sans-serif';
  const widest = () => Math.max(...lines.map((line) => ctx.measureText(line).width));
  const stackH = () => fontSize * (lines.length === 1 ? 1 : 2.15);
  ctx.font = `700 ${Math.round(fontSize)}px ${typeface}`;
  while (fontSize > 16 && (widest() > maxName || stackH() > boxH * 0.95)) {
    fontSize -= 1;
    ctx.font = `700 ${Math.round(fontSize)}px ${typeface}`;
  }
  ctx.shadowColor = 'rgba(232, 121, 249, 0.55)';
  ctx.shadowBlur = Math.max(6, width * 0.01);
  ctx.fillStyle = '#f6f3ff';
  const midY = height * 0.435;
  const gap = fontSize * 1.08;
  const startY = lines.length === 1 ? midY : midY - gap / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, width * 0.10, startY + index * gap);
  });
  ctx.shadowBlur = 0;

  if (login) {
    ctx.fillStyle = '#c4b5fd';
    ctx.font = `500 ${Math.round(height * 0.022)}px "Segoe UI", "Noto Sans", sans-serif`;
    ctx.fillText(login, width * 0.10, height * 0.542);
  }

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
