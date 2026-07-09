import CallScreen from './components/CallScreen'

export interface CallData {
  leadName: string
  yourName: string
  geminiResearch: string
}

const DEFAULT_CALL_DATA: CallData = {
  leadName: '',
  yourName: '',
  geminiResearch: '',
}

export default function App() {
  return (
    <div className="app">
      <CallScreen callData={DEFAULT_CALL_DATA} onReset={() => window.location.reload()} />
    </div>
  )
}
