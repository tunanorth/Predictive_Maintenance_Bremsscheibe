export function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>TEST SEITE - FUNKTIONIERT!</h1>
      <p>Wenn Sie das sehen, funktioniert React grundsätzlich.</p>
      <p>Zeit: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
