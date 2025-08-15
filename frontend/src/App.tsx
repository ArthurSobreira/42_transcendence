function App() {
  // Aqui usamos classes do Tailwind para estilizar
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-mono">
      <header className="text-center p-8">
        <h1 className="text-5xl font-bold text-cyan-400 animate-pulse">
          ft_transcendence
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Frontend Setup - Test Page
        </p>
      </header>
      
      <main className="bg-gray-800 p-6 rounded-lg shadow-lg border border-cyan-500">
        <h2 className="text-2xl mb-4 text-center">Setup Status</h2>
        <ul className="list-disc list-inside space-y-2">
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✔</span> React
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✔</span> Vite
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✔</span> TypeScript
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✔</span> Tailwind CSS
          </li>
        </ul>
      </main>

      <footer className="mt-8 text-sm text-gray-500">
        <p>Container infrastructure is ready.</p>
      </footer>
    </div>
  )
}

export default App