const prisma = require('../config/db');

const saveToHistory = async (req, res) => {
  try {
    const { songTitle, artist, youtubeLink, mood, language, genre } = req.body;

    const history = await prisma.songHistory.create({
      data: {
        userId: req.user.id,
        songTitle,
        artist,
        youtubeLink,
        mood,
        language,
        genre
      }
    });

    res.json({ success: true, history });
  } catch (error) {
    console.error('Error saving to history:', error);
    res.status(500).json({ success: false, error: 'Failed to save to history' });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await prisma.songHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
};

const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await prisma.songHistory.findUnique({
      where: { id }
    });

    if (!song) {
      return res.status(404).json({ success: false, error: 'Song history not found' });
    }

    if (song.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await prisma.songHistory.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ success: false, error: 'Failed to delete song' });
  }
};

module.exports = { saveToHistory, getHistory, deleteHistory };
