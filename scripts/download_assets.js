const https = require('https');
const fs = require('fs');
const path = require('path');

const ASSETS = [
  // Hero
  {
    url: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=1600&q=80',
    dest: 'public/images/hero/vice-city-hero.webp',
  },
  // Avatars
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    dest: 'public/images/avatars/scout-1.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    dest: 'public/images/avatars/scout-2.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    dest: 'public/images/avatars/scout-3.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    dest: 'public/images/avatars/scout-4.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    dest: 'public/images/avatars/ai-recon.webp',
  },
  // Discoveries
  {
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/discoveries/ghost-ship.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1519074069444-1ba4e4125b2a?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/discoveries/military-jet.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/discoveries/florida-panther.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/discoveries/jack-of-hearts.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/discoveries/sunken-wreck.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/discoveries/albino-gator.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/discoveries/listening-post.webp',
  },
  // Category Fallbacks
  {
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/categories/hidden-location.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/categories/rare-vehicle.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/categories/easter-egg.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/categories/encounter.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/categories/wildlife.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/categories/unusual-event.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    dest: 'public/images/categories/hidden-activity.webp',
  },
  // Vehicles
  {
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    dest: 'public/images/vehicles/banshee.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
    dest: 'public/images/vehicles/cheetah.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1000&q=80',
    dest: 'public/images/vehicles/torero.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    dest: 'public/images/vehicles/sandstorm.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    dest: 'public/images/vehicles/jetmax.webp',
  },
  {
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80',
    dest: 'public/images/vehicles/hydra.webp',
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const fullDest = path.resolve(process.cwd(), dest);
    fs.mkdirSync(path.dirname(fullDest), { recursive: true });

    function get(u) {
      https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
        const fileStream = fs.createWriteStream(fullDest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(fullDest);
          console.log(`[SAVED] ${dest} (${Math.round(stats.size / 1024)} KB)`);
          resolve();
        });
        fileStream.on('error', reject);
      }).on('error', reject);
    }

    get(url);
  });
}

async function run() {
  console.log(`Starting download of ${ASSETS.length} visual assets...`);
  for (const asset of ASSETS) {
    try {
      await downloadFile(asset.url, asset.dest);
    } catch (err) {
      console.error(`[ERROR] Failed to download ${asset.dest}:`, err.message);
    }
  }
  console.log('Finished visual asset download.');
}

run();
