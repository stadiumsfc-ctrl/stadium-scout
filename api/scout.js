export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, profileData } = req.body || {};
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || '';

  // PROFILE SAVE — Step 1 completion
  if (prompt === 'PROFILE_SAVE' && profileData) {
    try {
      if (APPS_SCRIPT_URL) {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'PROFILE_SAVE', ...profileData })
        });
      }
      return res.status(200).json({ status: 'profile_saved' });
    } catch (err) {
      return res.status(200).json({ status: 'save_attempted' });
    }
  }

  // FULL SUBMISSION — all data + YouTube links
  if (prompt === 'SHEET_SAVE' && profileData) {
    try {
      if (APPS_SCRIPT_URL) {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'FULL_SUBMIT', ...profileData })
        });
      }
      return res.status(200).json({ status: 'submitted' });
    } catch (err) {
      return res.status(200).json({ status: 'submit_attempted' });
    }
  }

  // AI PROFILE ANALYSIS
  if (prompt) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      console.error('AI API error:', err);
      return res.status(500).json({ error: 'API request failed' });
    }
  }

  return res.status(400).json({ error: 'Invalid request' });
}
