export default function Loader({ fullPage }) {
  return (
    <div className={fullPage ? 'page-loader' : ''} style={fullPage ? undefined : { padding: '2rem' }}>
      <div className="spinner" />
    </div>
  );
}
