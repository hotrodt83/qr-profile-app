import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="public-profile">
      <div className="public-profile-card">
        <h1 className="public-profile-name">Not found</h1>
        <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
          This profile doesn’t exist or has been removed.
        </p>
        <Link href="/" className="public-profile-button">
          Go home
        </Link>
      </div>
    </div>
  )
}
