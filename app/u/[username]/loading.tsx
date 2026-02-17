export default function PublicProfileLoading() {
  return (
    <div className="publicProfileShell">
      <div className="publicProfileCard publicProfileCard--loading">
        <div className="publicProfileSpinner" aria-hidden />
        <p className="publicProfileLoadingText">Loading profile…</p>
      </div>
    </div>
  );
}
