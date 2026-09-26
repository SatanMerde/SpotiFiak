const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Get addon registry
app.get('/api/addons', (req, res) => {
  try {
    const registry = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'addons', 'registry.json'), 'utf8')
    );
    const { type, search } = req.query;
    let addons = registry.addons || [];

    if (type && type !== 'all') {
      addons = addons.filter(a => a.type === type);
    }
    if (search) {
      const q = search.toLowerCase();
      addons = addons.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    res.json({ addons, total: addons.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load addon registry' });
  }
});

// API: Get a specific addon's manifest
app.get('/api/addons/:id', (req, res) => {
  try {
    const registry = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'addons', 'registry.json'), 'utf8')
    );
    const addon = (registry.addons || []).find(a => a.id === req.params.id);
    if (!addon) return res.status(404).json({ error: 'Addon not found' });
    res.json(addon);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load addon' });
  }
});

// API: Get addon source code (for local addons)
app.get('/api/addons/:id/source', (req, res) => {
  try {
    const registry = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'addons', 'registry.json'), 'utf8')
    );
    const addon = (registry.addons || []).find(a => a.id === req.params.id);
    if (!addon) return res.status(404).json({ error: 'Addon not found' });

    if (addon.source === 'local') {
      const filePath = path.join(__dirname, 'addons', 'local', addon.file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ content, type: addon.type });
      } else {
        res.status(404).json({ error: 'Addon file not found' });
      }
    } else if (addon.source === 'github') {
      // Return the GitHub raw URL for the client to fetch
      res.json({ url: addon.github_raw_url, type: addon.type });
    } else {
      res.status(400).json({ error: 'Unknown source type' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to load addon source' });
  }
});

// API: Fetch Spicetify extensions from GitHub
app.get('/api/spicetify/extensions', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.github.com/search/repositories?q=topic:spicetify-extensions&sort=stars&order=desc&per_page=20',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SpotiFiak/1.0'
        }
      }
    );
    const data = await response.json();
    const extensions = (data.items || []).map(repo => ({
      id: `spicetify-${repo.name}`,
      name: repo.name,
      description: repo.description || 'No description',
      author: repo.owner.login,
      stars: repo.stargazers_count,
      url: repo.html_url,
      source: 'spicetify',
      type: 'extension',
      avatar: repo.owner.avatar_url,
      updated: repo.updated_at
    }));
    res.json({ extensions });
  } catch (err) {
    res.json({ extensions: [], error: 'GitHub API unavailable' });
  }
});

// Serve the PWA for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🎵 SpotiFiak v1.0                           ║
  ║   Spicetify for Mobile                        ║
  ║                                               ║
  ║   Server running at:                          ║
  ║   http://localhost:${PORT}                      ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});
