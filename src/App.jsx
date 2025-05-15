import { useEffect, useState } from "react";

const jurosPorPrazo = {
  12: 0,
  24: 6,
  36: 9,
  48: 12,
  60: 15,
  72: 18,
  84: 21,
  96: 24,
  108: 26,
  120: 30,
};

export default function App() {
  const [lotes, setLotes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [status, setStatus] = useState("todos");
  const [aba, setAba] = useState("disponibilidade");
  const [loteSelecionado, setLoteSelecionado] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("avista");
  const [prazo, setPrazo] = useState(12);

  useEffect(() => {
    fetch("https://api-disponibilidade.onrender.com/lotes")
      .then((res) => res.json())
      .then((data) => setLotes(data))
      .catch((err) => {
        console.error("Erro ao buscar lotes:", err);
        alert("Erro ao carregar dados da API. Verifique sua conexão.");
      });
  }, []);

  const lotesFiltrados = lotes.filter((lote) => {
    const busca = filtro.toLowerCase();
    const nome = lote.lote.toLowerCase();
    const statusMatch = status === "todos" || lote.status.toLowerCase() === status;
    return nome.includes(busca) && statusMatch;
  });

  const totalVendidos = lotes.filter((l) => l.status.toLowerCase() === "vendido").length;
  const totalDisponiveis = lotes.filter((l) => l.status.toLowerCase() === "disponível").length;

  function estaNaAvenida(lote) {
    const quadraRegex = /QUADRA (\d+)/i;
    const loteRegex = /LOTE (\d+)/i;
    const qMatch = lote.lote.match(quadraRegex);
    const lMatch = lote.lote.match(loteRegex);
    if (!qMatch || !lMatch) return false;
    const quadra = parseInt(qMatch[1]);
    const numLote = parseInt(lMatch[1]);
    if ([1, 2, 3, 4, 33, 34, 35].includes(quadra) && numLote <= 6) return true;
    if ([27, 58].includes(quadra) && numLote <= 29) return true;
    if ([28, 59].includes(quadra) && numLote <= 18) return true;
    if (quadra === 31 && numLote >= 8 && numLote <= 21) return true;
    if (quadra === 64 && numLote >= 17 && numLote <= 24) return true;
    if ([65, 66].includes(quadra) && numLote >= 27 && numLote <= 45) return true;
    if (![1, 2, 3, 4, 33, 34, 35, 27, 28, 31, 58, 59, 64, 65, 66].includes(quadra) && numLote <= 7) return true;
    return false;
  }

  function formatarValor(valor) {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function calcularValores(lote) {
    const valorM2 = estaNaAvenida(lote) ? 205 : 190;
    const valorBase = lote.area * valorM2;
    if (formaPagamento === "avista") {
      const valorFinal = Math.round(valorBase * 0.95 * 100) / 100;
      return { valorBase, valorFinal, desconto: 5 };
    } else {
      const juros = jurosPorPrazo[prazo] || 0;
      const valorFinal = Math.round(valorBase * (1 + juros / 100) * 100) / 100;
      const parcela = Math.round((valorFinal / prazo) * 100) / 100;
      return { valorBase, valorFinal, juros, parcela };
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9F9] px-4 sm:px-8 py-6">
      <header className="max-w-4xl mx-auto text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#556B2F] mb-2">
          Incorporadora Central Park LTDA
        </h1>
        <p className="text-base sm:text-lg text-gray-700">
          Disponibilidade | Loteamento Jardim Buriti
        </p>
      </header>

      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-800 mb-4">
        <span className="bg-white px-4 py-2 rounded-xl shadow">Disponíveis: <strong>{totalDisponiveis}</strong></span>
        <span className="bg-white px-4 py-2 rounded-xl shadow">Vendidos: <strong>{totalVendidos}</strong></span>
      </div>

      <nav className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        {["disponibilidade", "simulador"].map((item) => (
          <button
            key={item}
            onClick={() => setAba(item)}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-medium transition-colors duration-200 
              ${aba === item ? "bg-[#556B2F] text-white shadow-lg" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"}`}
          >
            {item === "disponibilidade" ? "Disponibilidade" : "Simulador de Valores"}
          </button>
        ))}
        <a
          href="/MAPA%20LOTEAMENTO%20-%20BURITI.pdf"
          download
          className="w-full sm:w-auto px-6 py-3 rounded-2xl font-medium transition-colors duration-200 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 text-center"
        >
          📄 Baixar Mapa
        </a>
      </nav>

      {/* Conteúdo das abas permanece abaixo */}
    </div>
  );
}
