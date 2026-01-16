export interface CnisResponse {
  cnisAnalysis: CnisAnalysisResultModel;
  cnisData: CnisModel;
}

export interface CnisAnalysisResultModel {
  _type: string;
  idade: TimeComponent;
  clientData: ClientData;
  tempoDeContribuicao: ContributionTimeEntry[];
  carenciaTotal: number;
  potencialValido: string;
  restritoValido: string;
  duracaoTotalEmDias: number;
  consolidadoResumido: ConsolidatedEntry[];
  points: number;
  // Dynamic keys for eligibility rules (e.g., aposentadoriaPorIdade...)
  [key: string]: any; 
}

export interface ClientData {
  clientName: string;
  clientMotherName: string;
  clientNIT: string;
  clientFederalDocument: string;
  clientBirthDate: string;
}

export interface TimeComponent {
  anos: number;
  meses: number;
  dias: number;
  abreviado: string;
}

export interface ContributionTimeEntry {
  seq: number;
  origemDoVinculo: string;
  tipoDoVinculo: string;
  indicadores: string;
  dados: {
    abreviado: string;
    dias: number;
    meses: number;
    anos: number;
  };
}

export interface ConsolidatedEntry {
  seq: number;
  indicadores?: string;
  isPendencia: boolean;
  origem: string;
  contributionTime: {
    abreviado: string;
    data: { dataInicio: string; dataFim?: string };
  };
  validContributionTime: {
    abreviado: string;
  };
  carencia: number;
  tipo: string;
}

export interface RetirementRule {
  type: string;
  eligibility: {
    isEligible: boolean;
    eligibilityDate: string | null;
    projectedFulfillmentDate: string | null;
  };
  requirements: {
    [key: string]: any;
  };
  points?: number;
  totalContributionYears?: number;
  age?: number;
}

export interface CnisModel {
  affiliateIdentification: {
    nit: string;
    cpf: string;
    nome: string;
    nomeDaMae: string;
    dataDeNascimento: string;
  };
  socialSecurityRelations: SocialSecurityRelation[];
}

export interface SocialSecurityRelation {
  socialSecurityAffiliationInfo: {
    seq: number;
    origemDoVinculo: string;
    dataInicio: string;
    dataFim?: string;
    indicadores?: string;
  };
  socialSecurityAffiliationEarningsHistory: EarningHistory[];
}

export interface EarningHistory {
  competencia: string;
  remuneracao?: string;
  indicadores?: string;
}
