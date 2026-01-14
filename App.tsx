import React, { useState } from 'react';
import { UploadCloud, Loader2, FileText, Check } from 'lucide-react';
import { analyzeCnis, AnalysisPayload } from './services/cnisService';
import { CnisResponse } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CnisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: 'FABIO DE ALMEIDA SILVA', // Prefilled based on example, but user can change
    federalDocument: '501.562.256-20',
    birthDate: '1964-06-23', // ISO Format
    email: 'user@example.com',
    phoneNumber: '5515997752078',
    gender: 'M',
    clientType: 'empregado_urbano'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecione o arquivo PDF do CNIS.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: AnalysisPayload = {
        ...form,
        gender: form.gender as 'M' | 'F',
        file: file
      };
      
      const result = await analyzeCnis(payload);
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao processar o CNIS.");
    } finally {
      setLoading(false);
    }
  };

  if (data) {
    return <AnalysisDashboard data={data} onReset={() => setData(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Info/Hero */}
        <div className="bg-blue-600 p-8 md:w-2/5 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-4">CNIS Analyser Pro</h1>
            <p className="text-blue-100 mb-8 leading-relaxed">
              Faça o upload do extrato CNIS (PDF) e receba uma análise detalhada sobre tempo de contribuição, carência e previsões de aposentadoria em segundos.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/50 p-1.5 rounded-full">
                    <Check size={16} />
                </div>
                <span className="text-sm font-medium">Análise de Vínculos e Pendências</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/50 p-1.5 rounded-full">
                    <Check size={16} />
                </div>
                <span className="text-sm font-medium">Cálculo de Regras de Transição</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/50 p-1.5 rounded-full">
                    <Check size={16} />
                </div>
                <span className="text-sm font-medium">Gráfico de Evolução Salarial</span>
              </li>
            </ul>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full opacity-30 blur-3xl"></div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:w-3/5 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Dados do Segurado</h2>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <div className="mt-0.5"><UploadCloud size={16}/></div>
                {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={form.name} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Nome do Cliente"
                        required
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <input 
                        type="text" 
                        name="federalDocument" 
                        value={form.federalDocument} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="000.000.000-00"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input 
                        type="date" 
                        name="birthDate" 
                        value={form.birthDate} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                    <select 
                        name="gender" 
                        value={form.gender} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input 
                        type="tel" 
                        name="phoneNumber" 
                        value={form.phoneNumber} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="(11) 99999-9999"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="usuario@exemplo.com"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Segurado</label>
                <select 
                    name="clientType" 
                    value={form.clientType} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                >
                    <option value="empregado_urbano">Empregado Urbano</option>
                    <option value="empregado_rural">Empregado Rural</option>
                    <option value="empregado_domestico">Empregado Doméstico</option>
                    <option value="trabalhador_avulso">Trabalhador Avulso</option>
                    <option value="contribuinte_individual_autonomo">Contribuinte Individual (Autônomo)</option>
                    <option value="contribuinte_individual_prestador">Contribuinte Individual (Prestador de Serviço)</option>
                    <option value="mei">MEI</option>
                    <option value="segurado_especial">Segurado Especial</option>
                    <option value="segurado_facultativo">Segurado Facultativo</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extrato CNIS (PDF)</label>
                <div className={`
                    border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                    ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
                `}>
                    <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden" 
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center">
                        {file ? (
                            <>
                                <FileText size={32} className="text-blue-500 mb-2" />
                                <span className="text-sm font-medium text-blue-700">{file.name}</span>
                                <span className="text-xs text-blue-500 mt-1">Clique para trocar</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={32} className="text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-600">Clique para selecionar o PDF</span>
                                <span className="text-xs text-gray-400 mt-1">Suporta arquivos até 10MB</span>
                            </>
                        )}
                    </label>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:translate-y-px disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Analisando dados...
                    </>
                ) : (
                    'Processar Análise'
                )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
