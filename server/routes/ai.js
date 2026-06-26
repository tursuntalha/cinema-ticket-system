const express = require('express');
const axios = require('axios');
const Movie = require('../models/Movie');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function queryOllama(prompt) {
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'qwen2.5:7b',
      prompt: prompt,
      stream: false
    });
    return response.data.response;
  } catch (err) {
    console.error('Ollama error:', err.message);
    return null;
  }
}

const INTENT_PROMPT = `
Sen bir sinema asistanısın. Kullanıcının ruh haline ve tercihlerine göre film önerisi yapıyorsun.
Kullanıcı mesajını analiz edip şu formatta JSON çıktısı üret:
{
  "mood": "mutlu/romantik/macera/gerilim/hüzünlü/komik",
  "preferredGenres": ["genre1", "genre2"],
  "maxDuration": 120,
  "companions": "yalnız/arkadaş/aile/sevgili",
  "moodDescription": "kısa açıklama"
}
Sadece JSON döndür, başka metin yazma.
Kullanıcı: `;

router.post('/recommend', protect, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    const intentRaw = await queryOllama(INTENT_PROMPT + query);
    let intent = {};
    try {
      intent = JSON.parse(intentRaw);
    } catch {
      intent = { preferredGenres: [], maxDuration: 180, mood: 'nötr', companions: 'yalnız', moodDescription: query };
    }

    const filter = { isActive: true };
    if (intent.preferredGenres && intent.preferredGenres.length > 0) {
      filter.genre = { $in: intent.preferredGenres };
    }
    if (intent.maxDuration) {
      filter.duration = { $lte: intent.maxDuration };
    }

    const candidates = await Movie.find(filter).limit(10);
    if (candidates.length === 0) {
      const allMovies = await Movie.find({ isActive: true }).limit(5);
      const movieList = allMovies.map(m => `${m.title} (${m.genre.join(', ')}, ${m.duration}dk)`).join('\n');
      return res.json({
        intent,
        recommendations: allMovies.map(m => ({
          movie: m,
          reasoning: 'Bu film ilginizi çekebilir.'
        })),
        source: 'fallback'
      });
    }

    const movieListStr = candidates.map(m => `- ${m.title} | Tür: ${m.genre.join(', ')} | Süre: ${m.duration}dk | Puan: ${m.rating}`).join('\n');

    const rankingPrompt = `Kullanıcı ruh hali: ${intent.moodDescription || query}
Kullanıcı tercihleri: ${JSON.stringify(intent)}

Aşağıdaki filmlerden EN İYİ 3 tanesini seç ve her biri için neden bu filmi önerdiğini Türkçe açıkla.
Sadece şu formatta JSON döndür:
[
  {"title": "Film Adı", "reason": "Neden bu film?"},
  {"title": "Film Adı", "reason": "Neden bu film?"},
  {"title": "Film Adı", "reason": "Neden bu film?"}
]

Filmler:
${movieListStr}`;

    const rankingRaw = await queryOllama(rankingPrompt);
    let recommendations = [];
    try {
      const parsed = JSON.parse(rankingRaw);
      recommendations = parsed.map(r => {
        const movie = candidates.find(m => m.title === r.title);
        return movie ? { movie, reasoning: r.reason } : null;
      }).filter(Boolean);
    } catch {
      recommendations = candidates.slice(0, 3).map(m => ({
        movie: m,
        reasoning: 'Bu film ruh halinize uygun olabilir.'
      }));
    }

    res.json({ intent, recommendations, source: 'ollama' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/rate', protect, async (req, res) => {
  try {
    const { movieId, score } = req.body;
    const user = await User.findById(req.user._id);
    const existing = user.ratings.find(r => r.movie.toString() === movieId);
    if (existing) {
      existing.score = score;
    } else {
      user.ratings.push({ movie: movieId, score });
    }
    const movie = await Movie.findById(movieId);
    if (movie && !user.preferredGenres.includes) {
      movie.genre.forEach(g => {
        if (!user.preferredGenres.includes(g)) {
          user.preferredGenres.push(g);
        }
      });
    }
    await user.save();
    res.json({ message: 'Rating saved', ratings: user.ratings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
