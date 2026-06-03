import Modal from '../ui/Modal';

export default function TrailerModal({ open, onClose, url }) {
  const embedUrl = url?.includes('youtube.com/watch')
    ? url.replace('watch?v=', 'embed/')
    : url?.includes('youtu.be/')
      ? `https://www.youtube.com/embed/${url.split('/').pop()}`
      : url;

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
