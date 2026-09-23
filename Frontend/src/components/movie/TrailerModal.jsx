import Modal from '../ui/Modal';

export default function TrailerModal({ open, onClose, url }) {
  const getEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    try {
      if (rawUrl.includes('youtube.com/embed/')) return rawUrl;
      if (rawUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(rawUrl);
        const v = urlObj.searchParams.get('v');
        return v ? `https://www.youtube.com/embed/${v}?autoplay=1` : rawUrl;
      }
      if (rawUrl.includes('youtu.be/')) {
        const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : rawUrl;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <Modal open={open} onClose={onClose} wide>
      <div style={{ padding: '1rem', paddingTop: '2.5rem' }}>
        {embedUrl ? (
          <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
            <iframe
              title="Trailer"
              src={embedUrl}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Trailer URL not available
          </p>
        )}
      </div>
    </Modal>
  );
}
