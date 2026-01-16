import React, { useMemo, useState } from 'react';
import { CnisResponse, RetirementRule, SocialSecurityRelation } from '../types';
import { 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Briefcase, 
  TrendingUp, 
  FileText,
  DollarSign,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface Props {
  data: CnisResponse;
  onReset: () => void;
}

const formatCurrency = (val: string | null | undefined) => {
  if (!val || val === '' || val === null || val === undefined) return 'R$ 0,00';
  try {
    // Check if it already has currency symbol or needs parsing
    const num = parseFloat(val.toString().replace('.', '').replace(',', '.'));
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  } catch (e) {
    return 'R$ 0,00';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};
const formatDaysToTime = (days: number) => {
  const anos = Math.floor(days / 365);
  const meses = Math.floor((days % 365) / 30);
  const diasRestantes = Math.floor((days % 365) % 30);
  return `${anos}a ${meses}m ${diasRestantes}d`;
};
const AnalysisDashboard: React.FC<Props> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'history' | 'wages'>('overview');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const { cnisAnalysis, cnisData } = data;

  // Extract retirement rules from the flat object
  const retirementRules = useMemo(() => {
    return Object.keys(cnisAnalysis)
      .filter(key => key.startsWith('aposentadoria'))
      .map(key => ({
        key,
        data: cnisAnalysis[key] as RetirementRule
      }))
      .sort((a, b) => {
         // Sort eligible first
         if (a.data.eligibility.isEligible && !b.data.eligibility.isEligible) return -1;
         if (!a.data.eligibility.isEligible && b.data.eligibility.isEligible) return 1;
         return 0;
      });
  }, [cnisAnalysis]);

  // Flatten wages for chart
  const wageData = useMemo(() => {
    const points: { date: string; value: number; label: string }[] = [];
    cnisData.socialSecurityRelations?.forEach(rel => {
      rel.socialSecurityAffiliationEarningsHistory?.forEach(earn => {
        if (earn.remuneracao && earn.competencia) {
          try {
            const val = parseFloat(earn.remuneracao.toString().replace('.', '').replace(',', '.'));
            if (!isNaN(val)) {
                points.push({
                    date: earn.competencia,
                    label: new Date(earn.competencia).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
                    value: val
                });
            }
          } catch (e) {
            console.warn('Error parsing wage data:', e);
          }
        }
      });
    });
    return points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [cnisData]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <User size={20} />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">
                        {cnisAnalysis.clientData.clientName}
                    </h1>
                    <div className="text-xs text-gray-500 flex gap-3">
                        <span>CPF: {cnisAnalysis.clientData.clientFederalDocument}</span>
                        <span>NIT: {cnisAnalysis.clientData.clientNIT}</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={onReset}
                className="text-sm text-gray-600 hover:text-blue-600 font-medium px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
            >
                Nova Análise
            </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-blue-600 text-sm font-semibold mb-1 flex items-center gap-1">
                        <Calendar size={16} /> Idade Atual
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{cnisAnalysis.idade.abreviado}</div>
                    <div className="text-xs text-gray-500">
                        {cnisAnalysis.idade.anos} anos
                    </div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <div className="text-emerald-600 text-sm font-semibold mb-1 flex items-center gap-1">
                        <Clock size={16} /> Tempo Contrib.
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{formatDaysToTime(cnisAnalysis.duracaoTotalEmDias)}</div>
                    <div className="text-xs text-gray-500">Total líquido</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="text-amber-600 text-sm font-semibold mb-1 flex items-center gap-1">
                        <CheckCircle size={16} /> Carência
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{cnisAnalysis.carenciaTotal}</div>
                    <div className="text-xs text-gray-500">Meses acumulados</div>
                </div>
                 <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-purple-600 text-sm font-semibold mb-1 flex items-center gap-1">
                        <TrendingUp size={16} /> Pontos
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{cnisAnalysis.points}</div>
                    <div className="text-xs text-gray-500">Regra de pontos</div>
                </div>
            </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
            <nav className="-mb-px flex space-x-8">
                {[
                    { id: 'overview', label: 'Visão Geral' },
                    { id: 'eligibility', label: 'Elegibilidade' },
                    { id: 'history', label: 'Vínculos & Pendências' },
                    { id: 'wages', label: 'Evolução Salarial' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === tab.id 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* VIEW: OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Simplified Eligibility Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={20}/> Resumo de Direitos
                    </h2>
                    <div className="space-y-4">
                        {retirementRules.slice(0, 5).map((rule, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[70%]" title={rule.data.type}>
                                    {rule.data.type}
                                </span>
                                {rule.data.eligibility.isEligible ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Adquirido
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        {rule.data.eligibility.projectedFulfillmentDate 
                                            ? new Date(rule.data.eligibility.projectedFulfillmentDate).getFullYear() 
                                            : 'Não atingido'}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Last Wages Summary */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="text-blue-600" size={20}/> Últimos Salários
                    </h2>
                    <div className="flex-1 overflow-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competência</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {wageData.slice(-6).reverse().map((wage, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{wage.label}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(wage.value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: ELIGIBILITY */}
        {activeTab === 'eligibility' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {retirementRules.map((rule, idx) => {
                    const isEligible = rule.data.eligibility.isEligible;
                    return (
                        <div key={idx} className={`
                            relative overflow-hidden rounded-xl border-2 p-6 transition-shadow hover:shadow-md
                            ${isEligible ? 'border-green-500 bg-white' : 'border-gray-200 bg-white'}
                        `}>
                            {isEligible && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">
                                    DIREITO ADQUIRIDO
                                </div>
                            )}
                            
                            <h3 className="text-base font-bold text-gray-900 mb-2 h-14 line-clamp-2" title={rule.data.type}>
                                {rule.data.type}
                            </h3>

                            <div className="space-y-4 mt-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Previsão</p>
                                    <p className={`text-lg font-medium ${isEligible ? 'text-green-600' : 'text-gray-900'}`}>
                                        {isEligible 
                                            ? 'Já possui requisitos' 
                                            : formatDate(rule.data.eligibility.projectedFulfillmentDate)
                                        }
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Requisitos Faltantes</p>
                                    {rule.data.requirements.atingiuRequisitoDeIdade === false && (
                                         <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Idade</span>
                                            <span className="text-red-500 font-medium">{rule.data.requirements.requiredAge} anos</span>
                                         </div>
                                    )}
                                    {rule.data.requirements.atingiuRequisitoDeContribuicao === false && (
                                         <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Contribuição</span>
                                            <span className="text-red-500 font-medium">{rule.data.requirements.requiredContributionYears} anos</span>
                                         </div>
                                    )}
                                    {rule.data.requirements.atingiuRequisitoDePontos === false && (
                                         <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Pontos</span>
                                            <span className="text-red-500 font-medium">{rule.data.requirements.requiredPoints} pts</span>
                                         </div>
                                    )}
                                    {/* If everything is met but isEligible is false (rare edge case or processing delay), show generic */}
                                    {!isEligible && 
                                     rule.data.requirements.atingiuRequisitoDeIdade !== false && 
                                     rule.data.requirements.atingiuRequisitoDeContribuicao !== false &&
                                     rule.data.requirements.atingiuRequisitoDePontos !== false && (
                                        <span className="text-sm text-gray-500">Verificar detalhes complementares.</span>
                                     )}
                                    {isEligible && <span className="text-sm text-green-600 font-medium">Todos os requisitos atendidos.</span>}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}

        {/* VIEW: HISTORY */}
        {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-2 py-3 w-10"></th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seq</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa / Origem</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo Líquido</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicadores</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cnisAnalysis.consolidadoResumido.map((item) => {
                                const isExpanded = expandedRow === item.seq;
                                const relationDetails = cnisData.socialSecurityRelations.find(
                                    rel => rel.socialSecurityAffiliationInfo.seq === item.seq
                                );
                                
                                return (
                                    <React.Fragment key={item.seq}>
                                        <tr 
                                            className={`cursor-pointer hover:bg-gray-50 transition-colors ${item.isPendencia ? 'bg-amber-50/30' : ''}`}
                                            onClick={() => setExpandedRow(isExpanded ? null : item.seq)}
                                        >
                                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {isExpanded ? (
                                                    <ChevronDown size={16} className="text-blue-600" />
                                                ) : (
                                                    <ChevronRight size={16} className="text-gray-400" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.seq}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                <div className="flex flex-col">
                                                    <span>{item.origem}</span>
                                                    <span className="text-xs text-gray-500 font-normal">{item.tipo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(item.contributionTime.data.dataInicio)} - {item.contributionTime.data.dataFim ? formatDate(item.contributionTime.data.dataFim) : 'Atual'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.validContributionTime.abreviado}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {item.indicadores && typeof item.indicadores === 'string' && item.indicadores.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.indicadores.split('-').filter(ind => ind && ind.trim()).map((ind, i) => (
                                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                                {ind}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {item.isPendencia ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        <AlertTriangle size={12} /> Pendência
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle size={12} /> Ok
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                        
                                        {isExpanded && relationDetails && (
                                            <tr>
                                                <td colSpan={7} className="px-8 py-6 bg-gray-50">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        {/* Informações do Vínculo */}
                                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                <Briefcase size={16} className="text-blue-600" />
                                                                Informações do Vínculo
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Origem:</span>
                                                                    <span className="text-gray-900 font-medium">{relationDetails.socialSecurityAffiliationInfo.origemDoVinculo}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Data Início:</span>
                                                                    <span className="text-gray-900 font-medium">{formatDate(relationDetails.socialSecurityAffiliationInfo.dataInicio)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Data Fim:</span>
                                                                    <span className="text-gray-900 font-medium">{relationDetails.socialSecurityAffiliationInfo.dataFim ? formatDate(relationDetails.socialSecurityAffiliationInfo.dataFim) : 'Em andamento'}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Tempo Total:</span>
                                                                    <span className="text-gray-900 font-medium">{item.contributionTime.abreviado}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Tempo Válido:</span>
                                                                    <span className="text-green-600 font-medium">{item.validContributionTime.abreviado}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Carência:</span>
                                                                    <span className="text-gray-900 font-medium">{item.carencia} meses</span>
                                                                </div>
                                                                {relationDetails.socialSecurityAffiliationInfo.indicadores && typeof relationDetails.socialSecurityAffiliationInfo.indicadores === 'string' && relationDetails.socialSecurityAffiliationInfo.indicadores.length > 0 && (
                                                                    <div className="pt-2 border-t border-gray-200">
                                                                        <span className="text-gray-600 text-xs">Indicadores:</span>
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {relationDetails.socialSecurityAffiliationInfo.indicadores.split('-').filter(ind => ind && ind.trim()).map((ind, i) => (
                                                                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                                                    {ind}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Histórico de Remunerações */}
                                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                <DollarSign size={16} className="text-green-600" />
                                                                Histórico de Remunerações
                                                            </h4>
                                                            {relationDetails.socialSecurityAffiliationEarningsHistory.length > 0 ? (
                                                                <div className="max-h-64 overflow-y-auto">
                                                                    <table className="min-w-full text-sm">
                                                                        <thead className="bg-gray-50 sticky top-0">
                                                                            <tr>
                                                                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Competência</th>
                                                                                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500">Valor</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100">
                                                                            {relationDetails.socialSecurityAffiliationEarningsHistory.slice(-12).reverse().map((earning, idx) => (
                                                                                <tr key={idx}>
                                                                                    <td className="px-2 py-2 text-gray-600">
                                                                                        {new Date(earning.competencia).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                                                                                    </td>
                                                                                    <td className="px-2 py-2 text-right text-gray-900 font-medium">
                                                                                        {formatCurrency(earning.remuneracao)}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 italic">Sem histórico de remunerações registrado</p>
                                                            )}
                                                        </div>

                                                        {/* Pendências (se houver) */}
                                                        {item.isPendencia && (
                                                            <div className="lg:col-span-2 bg-amber-50 rounded-lg border border-amber-200 p-4">
                                                                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                                                    <AlertTriangle size={16} className="text-amber-600" />
                                                                    Pendências Identificadas
                                                                </h4>
                                                                <div className="text-sm text-amber-800">
                                                                    <p className="mb-2">Este vínculo possui pendências que podem afetar o cômputo do tempo de contribuição.</p>
                                                                    {item.indicadores && typeof item.indicadores === 'string' && item.indicadores.length > 0 && (
                                                                        <div className="mt-2">
                                                                            <span className="font-medium">Indicadores de alerta:</span>
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                {item.indicadores.split('-').filter(ind => ind && ind.trim()).map((ind, i) => (
                                                                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-200 text-amber-900 border border-amber-300">
                                                                                        {ind}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <p className="mt-3 text-xs text-amber-700">
                                                                        ⚠️ Recomenda-se verificar a documentação deste vínculo e regularizar possíveis inconsistências junto ao empregador ou INSS.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* VIEW: WAGES */}
        {activeTab === 'wages' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[500px]">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Histórico de Remunerações</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={wageData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="label" 
                            stroke="#9ca3af" 
                            fontSize={12} 
                            tickMargin={10}
                            minTickGap={30}
                        />
                        <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12}
                            tickFormatter={(value) => `R$${value/1000}k`}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Salário']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#2563eb" 
                            strokeWidth={2} 
                            dot={false}
                            activeDot={{ r: 6, fill: "#2563eb" }} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}

      </main>
    </div>
  );
};

export default AnalysisDashboard;
