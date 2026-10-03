export interface KeyFinding {
  parameter: string;
  value: string;
  status: 'normal' | 'attention' | 'warning';
  plainExplanation: string;
}

export interface MedicalTermDefinition {
  term: string;
  medicalDefinition: string;
  plainLanguage: string;
}

export interface MedTranslationReport {
  id: string;
  title: string;
  reportType: 'Lipid & Blood Panel' | 'Echocardiogram' | 'Discharge Summary' | 'General Lab';
  date: string;
  facility: string;
  originalFileName: string;
  plainSummary: {
    en: string;
    hi: string;
    es: string;
  };
  keyFindings: KeyFinding[];
  medicalGlossary: MedicalTermDefinition[];
  recommendedQuestions: string[];
}
