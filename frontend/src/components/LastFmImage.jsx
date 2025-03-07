import { useState, useEffect } from 'react';

const LastFmImage = ({ artist, track }) => {
  const [imageUrl, setImageUrl] = useState('https://placehold.co/300x300?text=Loading...');
  const LASTFM_API_KEY = '39710bc3d90394f50aab976eca17a709';

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Try to get album image first
        const trackResponse = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`
        );
        const trackData = await trackResponse.json();

        if (trackData.track?.album?.image) {
          const images = trackData.track.album.image;
          const largestImage = images.find(img => img.size === 'extralarge')?.['#text'] ||
                             images.find(img => img.size === 'large')?.['#text'] ||
                             images[0]?.['#text'];
          if (largestImage) {
            setImageUrl(largestImage);
            return;
          }
        }

        // If no album image, try artist image
        const artistResponse = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&format=json`
        );
        const artistData = await artistResponse.json();

        if (artistData.artist?.image) {
          const images = artistData.artist.image;
          const largestImage = images.find(img => img.size === 'extralarge')?.['#text'] ||
                             images.find(img => img.size === 'large')?.['#text'] ||
                             images[0]?.['#text'];
          if (largestImage) {
            setImageUrl(largestImage);
            return;
          }
        }

        // If no images found, set to default
        setImageUrl('https://wikisound.org/mastering/Audio-waveform-player/data/default_artwork/music_ph.png');
      } catch (error) {
        console.error('Error fetching image:', error);
        setImageUrl('https://wikisound.org/mastering/Audio-waveform-player/data/default_artwork/music_ph.png');
      }
    };

    fetchImage();
  }, [artist, track]);

  return (
    <img 
      src={imageUrl} 
      alt={`${track} by ${artist}`}
      className="song-image__img"
      onError={() => setImageUrl('https://wikisound.org/mastering/Audio-waveform-player/data/default_artwork/music_ph.png')}
    />
  );
};

export default LastFmImage;
