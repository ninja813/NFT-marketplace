import { Router } from 'express';
const router = Router();

router.get('/:seed.svg', (req, res) => {
  const seed = decodeURIComponent(req.params.seed || 'nft');
  const size = Math.min(Math.max(Number(req.query.size) || 800, 200), 1600);

  const colors = [
    ['#8B5CF6', '#14B8A6'],
    ['#14B8A6', '#F59E0B'],
    ['#8B5CF6', '#F59E0B'],
  ];
  const pair = colors[Math.abs(hashCode(seed)) % colors.length];

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${pair[0]}"/>
        <stop offset="100%" stop-color="${pair[1]}"/>
      </linearGradient>
      <filter id="glass">
        <feGaussianBlur stdDeviation="20" result="blur"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.98  0 0 0 0 0.96  0 0 0 0 0.93  0 0 0 0.6 0"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${size * 0.35}" fill="#ffffff30" filter="url(#glass)"/>
    <rect x="${size * 0.1}" y="${size * 0.6}" rx="${size * 0.05}" ry="${size * 0.05}" width="${size * 0.8}" height="${size * 0.25}" fill="#00000020"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Inter, system-ui, -apple-system" font-size="${size * 0.08}" fill="#ffffff"
      style="letter-spacing:1px">${escapeXml(seed)}</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export default router;
