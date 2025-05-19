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
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState("");
  const [filtroSimulador, setFiltroSimulador] = useState("");
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
    const busca = filtroDisponibilidade.toLowerCase();
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
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
    <div className="relative">
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-contain pointer-events-none"
        style={{
          backgroundImage: "url('/logo-buriti.webp')",
          opacity: 0.05,
          zIndex: 0,
        }}
      ></div>

      <div className="relative z-10 min-h-screen bg-[#F8F9F9] px-2 sm:px-8 py-4 text-sm sm:text-base">
        <header className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center mb-4">
          <img src="/logo-buriti.webp" alt="Logo Buriti" className="w-20 h-auto" />
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#556B2F] mb-1 leading-snug">
              Incorporadora Central Park LTDA
            </h1>
            <p className="text-sm sm:text-lg text-gray-700 leading-tight">
              Disponibilidade | Loteamento Jardim Buriti
            </p>
          </div>
        </header>

        <div className="text-center text-gray-600 text-sm mt-10">
          <p>O sistema est&aacute; funcionando corretamente! Mas o restante do conte&uacute;do precisa ser restaurado.</p>
        </div>
      </div>
    </div>
  );
}
