import React from 'react'

export default function App() {
  return (
    <div className="app">
      <header className="bar">
        <h1>Pathways — Minimal App</h1>
      </header>

      <main className="content">
        <p>This is a minimal Vite + React app. Drop your files into <code>frontend/minimal-app/src</code> to start.
        </p>

        <div className="box">
          <p>Helpful commands:</p>
          <pre>
npm install
npm run dev
          </pre>
        </div>
      </main>

      <footer className="bar small">Minimal scaffold — safe to modify</footer>
    </div>
  )
}
