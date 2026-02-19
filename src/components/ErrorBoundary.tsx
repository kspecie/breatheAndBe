import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-4xl">✦</p>
          <h1 className="text-xl font-bold text-[#3D2B1F]">Something went wrong</h1>
          <p className="text-sm text-[#8C6E5B]">Please refresh the page to try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-[#E8A87C] text-white hover:bg-[#C47B3A] transition-colors"
          >
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
