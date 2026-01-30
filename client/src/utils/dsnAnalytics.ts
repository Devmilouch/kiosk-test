import type { ProcessedDsnData } from "../stores/dsnUpload.store";

// Utilities to extract more real information from DSN data
export const getDsnAnalytics = (parsedDsnData: ProcessedDsnData | null) => {
  if (!parsedDsnData?.declaration?.entreprise?.etablissement?.individus) {
    return {
      hasData: false,
      totalEmployees: 0,
      genderBreakdown: { homme: 0, femme: 0 },
      totalRemuneration: 0,
      contractTypes: {},
      avgRemuneration: 0,
      hasRemunerationData: false,
      hasContractData: false,
      companyInfo: null
    };
  }

  const individus = parsedDsnData.declaration.entreprise.etablissement.individus;
  const declaration = parsedDsnData.declaration;
  
  // Analyse des contrats
  const contractTypes: Record<string, number> = {};
  let hasContractData = false;
  
  individus.forEach(individu => {
    individu.contrats?.forEach(contrat => {
      if (contrat.nature) {
        hasContractData = true;
        const type = contrat.nature;
        contractTypes[type] = (contractTypes[type] || 0) + 1;
      }
    });
  });

  // Remuneration analysis
  let totalRemuneration = 0;
  let hasRemunerationData = false;
  
  individus.forEach(individu => {
    individu.versements?.forEach(versement => {
      versement.remunerations?.forEach(remuneration => {
        const montant = parseFloat(remuneration.montant || '0');
        if (!isNaN(montant) && montant > 0) {
          hasRemunerationData = true;
          totalRemuneration += montant;
        }
      });
    });
  });

  // Gender distribution
  const genderBreakdown = individus.reduce(
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

  // Informations entreprise
  const companyInfo = declaration?.entreprise ? {
    siren: declaration.entreprise.siren,
    nic: declaration.entreprise.nic,
    etablissementNic: declaration.entreprise.etablissement?.nic
  } : null;

  return {
    hasData: true,
    totalEmployees: individus.length,
    genderBreakdown,
    totalRemuneration,
    contractTypes,
    avgRemuneration: hasRemunerationData && individus.length > 0 ? totalRemuneration / individus.length : 0,
    hasRemunerationData,
    hasContractData,
    companyInfo
  };
};

// Determines which questions can be calculated with available data
export const getCalculableQuestions = (parsedDsnData: ProcessedDsnData | null): string[] => {
  const analytics = getDsnAnalytics(parsedDsnData);
  
  if (!analytics.hasData) {
    return [];
  }

  const calculable: string[] = [];

  // Questions always calculable if we have individuals
  if (analytics.totalEmployees > 0) {
    calculable.push("S1-6_02", "S1-6_03"); // Employee count
  }

  // Questions calculable if we have gender data
  if (analytics.genderBreakdown.homme > 0 || analytics.genderBreakdown.femme > 0) {
    calculable.push("K_718", "K_719"); // Gender distribution
  }

  return calculable;
};

export default { getDsnAnalytics, getCalculableQuestions };