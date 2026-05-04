import { useState } from 'react'
import SetupScreen from './components/SetupScreen'
import CallScreen from './components/CallScreen'

export interface CallData {
  leadName: string
  yourName: string
  geminiResearch: string
}

export default function App() {
  const [callData, setCallData] = useState<CallData | null>(null)

  return (
    <div className="app">
      {!callData ? (
        <SetupScreen onStart={setCallData} />
      ) : (
        <CallScreen callData={callData} onReset={() => setCallData(null)} />
      )}
    </div>
  )
}
