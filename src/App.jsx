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
    <div className="min-h-screen bg-[#F8F9F9] p-8">
      <header className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#556B2F] mb-2">
          Incorporadora Central Park LTDA
        </h1>
        <p className="text-lg text-gray-700">
          Disponibilidade | Loteamento Jardim Buriti
        </p>
      </header>

      <nav className="max-w-4xl mx-auto flex justify-center gap-6 mb-8">
        {["disponibilidade", "simulador"].map((item) => (
          <button
            key={item}
            onClick={() => setAba(item)}
            className={`px-6 py-3 rounded-2xl font-medium transition-colors duration-200 
              ${aba === item ? "bg-[#556B2F] text-white shadow-lg" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"}`}
          >
            {item === "disponibilidade" ? "Disponibilidade" : "Simulador de Valores"}
          </button>
        ))}
        <a
          href="/MAPA%20LOTEAMENTO%20-%20BURITI.pdf"
          download
          className="px-6 py-3 rounded-2xl font-medium transition-colors duration-200 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
        >
          📄 Baixar Mapa
        </a>
      </nav>

      {aba === "disponibilidade" && (
        <section className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar por lote ou quadra..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            />
            <select
              className="w-full sm:w-1/4 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="disponível">Disponíveis</option>
              <option value="vendido">Vendidos</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {["ID", "Lote", "Área (m²)", "Status"].map((header) => (
                    <th key={header} className="bg-[#E8F0EA] px-4 py-2 text-sm font-semibold text-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lotesFiltrados.map((lote) => (
                  <tr key={lote.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">{lote.id}</td>
                    <td className="px-4 py-3 font-medium">{lote.lote}</td>
                    <td className="px-4 py-3">{lote.area}</td>
                    <td
                      className={`px-4 py-3 rounded-full w-max font-semibold 
                      ${lote.status === "Disponível" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {lote.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {aba === "simulador" && (
        <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="space-y-4">
            <select
              onChange={(e) => {
                const id = parseInt(e.target.value);
                setLoteSelecionado(lotes.find((l) => l.id === id) || null);
              }}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            >
              <option value="">Selecione um lote disponível</option>
              {lotes.filter((l) => l.status.toLowerCase() === "disponível").map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lote} ({l.area} m²)
                </option>
              ))}
            </select>

            {loteSelecionado && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                  >
                    <option value="avista">À vista</option>
                    <option value="prazo">Parcelado</option>
                  </select>
                  {formaPagamento === "prazo" && (
                    <select
                      className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556B2F] max-h-40 overflow-y-auto"
                      value={prazo}
                      onChange={(e) => setPrazo(parseInt(e.target.value))}
                    >
                      {Object.keys(jurosPorPrazo).map((p) => (
                        <option key={p} value={p}>
                          {p} meses
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="bg-[#F1F5F2] p-6 rounded-xl border border-[#E0E4E2] space-y-2">
                  {(() => {
                    const { valorBase, valorFinal, desconto, juros, parcela } = calcularValores(loteSelecionado);
                    return (
                      <>
                        <p><strong>Valor base:</strong> R$ {formatarValor(valorBase)}</p>
                        {formaPagamento === "avista" ? (
                          <>
                            <p><strong>Desconto:</strong> {desconto}%</p>
                            <p><strong>Valor final:</strong> R$ {formatarValor(valorFinal)}</p>
                          </>
                        ) : (
                          <>
                            <p><strong>Juros:</strong> {juros}%</p>
                            <p><strong>Valor total a prazo:</strong> R$ {formatarValor(valorFinal)}</p>
                            <p><strong>Parcela mensal:</strong> R$ {formatarValor(parcela)}</p>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
