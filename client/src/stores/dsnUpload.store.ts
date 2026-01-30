import { create } from "zustand";

// Types pour les éléments DSN spécifiques
interface DsnError {
  code?: string;
  message?: string;
  ligne?: number;
}

interface DsnPrime {
  type?: string;
  montant?: string;
  date?: string;
}

interface DsnRevenuAutre {
  type?: string;
  montant?: string;
  description?: string;
}

interface DsnActivite {
  code?: string;
  libelle?: string;
  heures?: string;
}

interface DsnRow {
  [key: string]: string | undefined;
}

// Types pour la structure DSN complète retournée par l'API
interface DsnDeclaration {
  nature: string;
  type: string;
  mois: string;
  entreprise: {
    siren: string;
    nic: string;
    etablissement: {
      nic: string;
      individus: DsnIndividu[];
    };
  };
  errors: DsnError[];
  validStatement: boolean;
}

interface DsnIndividu {
  identifiant: string;
  nomFamille: string;
  nomUsage?: string;
  prenoms: string;
  sexe: string; // '01' pour homme, '02' pour femme
  identifiantTechnique: string;
  contrats: DsnContrat[];
  versements: DsnVersement[];
}

interface DsnContrat {
  dateDebut: string;
  statutConventionnel: string;
  nature: string;
  numero: string;
  quotite?: string;
  modaliteTemps?: string;
}

interface DsnVersement {
  date: string;
  remunerations: DsnRemuneration[];
  primes: DsnPrime[];
  revenuAutres: DsnRevenuAutre[];
}

interface DsnRemuneration {
  dateDebut: string;
  dateFin: string;
  numeroContrat: string;
  type: string;
  nombreHeures?: string;
  montant: string;
  activites: DsnActivite[];
}

interface DsnFile {
  name: string;
  size: number;
  content?: string;
}

// Structure complète retournée par l'API
export interface ProcessedDsnData {
  message: string;
  filename: string;
  size: number;
  declaration: DsnDeclaration;
  dsnData: {
    rows: DsnRow[];
    errors: DsnError[];
  };
}

interface DsnUploadState {
  // State
  selectedFile: File | null;
  uploadedFile: DsnFile | null;
  parsedDsnData: ProcessedDsnData | null; // Nouvelles données DSN complètes
  isUploading: boolean;
  error: string | null;
  userAnswers: Record<string, string | number>; // Réponses saisies par l'utilisateur

  // Actions
  setSelectedFile: (file: File | null) => void;
  setUploadedFile: (file: DsnFile | null) => void;
  setParsedDsnData: (data: ProcessedDsnData | null) => void; // Nouvelle action
  setUploading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
  
  // User answers management
  setUserAnswer: (questionId: string, value: string | number) => void;
  getUserAnswer: (questionId: string) => string | number | undefined;
  clearUserAnswers: () => void;

  // Calculation functions for CSRD questions
  getEmployeeCount: () => number;
  getEmployeeCountByGender: () => { homme: number; femme: number };
  getEmployeeCountByContractType: () => Record<string, number>;
  getTotalRemunerationAmount: () => number;
}

export const useDsnUploadStore = create<DsnUploadState>((set, get) => ({
  // Initial state
  selectedFile: null,
  uploadedFile: null,
  parsedDsnData: null,
  isUploading: false,
  error: null,
  userAnswers: {},

  // Actions
  setSelectedFile: file => {
    set({ selectedFile: file, error: null });
  },

  setUploadedFile: file => {
    set({ uploadedFile: file });
  },

  setParsedDsnData: data => {
    set({ parsedDsnData: data });
  },

  setUploading: loading => {
    set({ isUploading: loading });
  },

  setError: error => {
    set({ error });
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      selectedFile: null,
      uploadedFile: null,
      parsedDsnData: null,
      isUploading: false,
      error: null,
      userAnswers: {},
    }),
    
  // User answers management
  setUserAnswer: (questionId, value) => {
    set(state => ({
      userAnswers: { ...state.userAnswers, [questionId]: value }
    }));
  },
  
  getUserAnswer: (questionId) => {
    const { userAnswers } = get();
    return userAnswers[questionId];
  },
  
  clearUserAnswers: () => {
    set({ userAnswers: {} });
  },

  // Calculation functions for CSRD questions
  getEmployeeCount: () => {
    const { parsedDsnData } = get();
    if (!parsedDsnData?.declaration?.entreprise?.etablissement?.individus) {
      return 0;
    }
    return parsedDsnData.declaration.entreprise.etablissement.individus.length;
  },

  getEmployeeCountByGender: () => {
    const { parsedDsnData } = get();
    if (!parsedDsnData?.declaration?.entreprise?.etablissement?.individus) {
      return { homme: 0, femme: 0 };
    }

    const individus = parsedDsnData.declaration.entreprise.etablissement.individus;
    const counts = individus.reduce(
      (acc, individu) => {
        if (individu.sexe === '01') {
          acc.homme += 1;
        } else if (individu.sexe === '02') {
          acc.femme += 1;
        }
        return acc;
      },
      { homme: 0, femme: 0 }
    );
    
    return counts;
  },

  getEmployeeCountByContractType: () => {
    const { parsedDsnData } = get();
    if (!parsedDsnData?.declaration?.entreprise?.etablissement?.individus) {
      return {};
    }

    const individus = parsedDsnData.declaration.entreprise.etablissement.individus;
    const contractCounts: Record<string, number> = {};
    
    individus.forEach(individu => {
      individu.contrats.forEach(contrat => {
        const contractType = contrat.nature || 'non-spécifié';
        contractCounts[contractType] = (contractCounts[contractType] || 0) + 1;
      });
    });
    
    return contractCounts;
  },

  getTotalRemunerationAmount: () => {
    const { parsedDsnData } = get();
    if (!parsedDsnData?.declaration?.entreprise?.etablissement?.individus) {
      return 0;
    }

    const individus = parsedDsnData.declaration.entreprise.etablissement.individus;
    let total = 0;
    
    individus.forEach(individu => {
      individu.versements.forEach(versement => {
        versement.remunerations.forEach(remuneration => {
          const montant = parseFloat(remuneration.montant || '0');
          if (!isNaN(montant)) {
            total += montant;
          }
        });
      });
    });
    
    return total;
  },
}));
