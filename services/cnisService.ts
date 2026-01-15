import { CnisResponse } from '../types';

export interface AnalysisPayload {
  name: string;
  federalDocument: string; // CPF
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: 'M' | 'F';
  clientType: string;
  file: File;
}

export const analyzeCnis = async (payload: AnalysisPayload): Promise<CnisResponse> => {
  const formData = new FormData();

  // The endpoint expects 'cnisDocument' as the file field
  formData.append('cnisDocument', payload.file);

  // The endpoint expects 'json' as a stringified JSON object
  const jsonMetadata = JSON.stringify({
    name: payload.name,
    federalDocument: payload.federalDocument,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    birthDate: new Date(payload.birthDate).toISOString(),
    gender: payload.gender === 'M' ? 'male' : 'female',
    clientType: payload.clientType
  });

  formData.append('json', jsonMetadata);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://agiliza.qa.epiousion.tech/api/customer/analysis-tool/cnis-fast-analysis';
  const response = await fetch(`${apiBaseUrl}/analyze`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      // Content-Type is set automatically by fetch when using FormData (multipart/form-data boundary)
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na análise: ${response.status} - ${errorText}`);
  }

  return response.json();
};
