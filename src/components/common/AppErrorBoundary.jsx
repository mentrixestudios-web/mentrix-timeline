import React from "react";

/**
 * Red de seguridad global: si cualquier pantalla lanza un error, en vez de
 * dejar la app congelada/en negro, muestra una pantalla de recuperación.
 */
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error, info) {
    console.error("Mentrix Línea de Tiempo - error capturado:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // Al cambiar de ruta, se intenta recuperar automáticamente
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, message: "" });
    }
  }

  goHome = () => {
    this.setState({ hasError: false, message: "" });
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border-2 border-amber-400/50 bg-[#0a1122] p-6 text-center text-white shadow-2xl">
          <div className="text-4xl mb-3">⏳</div>
          <h2 className="text-lg font-black text-amber-300 m-0">Algo se desordenó en el tiempo</h2>
          <p className="text-xs text-slate-300 mt-2 mb-5">
            Menti reparó la línea temporal. Tu progreso y monedas están a salvo.
          </p>
          <button
            type="button"
            onClick={this.goHome}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-sm active:scale-95 transition-transform"
          >
            Volver a la Pantalla Principal
          </button>
        </div>
      </div>
    );
  }
}
