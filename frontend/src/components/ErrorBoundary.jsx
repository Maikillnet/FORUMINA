import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-white p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-xl font-black">Что-то пошло не так</h1>
            <p className="text-sm text-[#8b949e]">
              Страница столкнулась с ошибкой. Попробуйте обновить страницу.
            </p>
            <button
              type="button"
              onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
              className="px-6 py-2 bg-[var(--color-accent)] text-black rounded-lg font-bold text-sm hover:opacity-90"
            >
              На главную
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
