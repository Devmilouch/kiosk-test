import type { ProcessedDsnData } from "../stores/dsnUpload.store";

// Utilitaires pour extraire plus d'informations réelles depuis les données DSN
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

  // Analyse des rémunérations
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

  // Répartition par genre
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

// Détermine quelles questions peuvent être calculées avec les données disponibles
export const getCalculableQuestions = (parsedDsnData: ProcessedDsnData | null): string[] => {
  const analytics = getDsnAnalytics(parsedDsnData);
  
  if (!analytics.hasData) {
    return [];
  }

  const calculable: string[] = [];

  // Questions toujours calculables si on a des individus
  if (analytics.totalEmployees > 0) {
    calculable.push("S1-6_02", "S1-6_03"); // Nombre d'employés
  }

  // Questions calculables si on a des données de genre
  if (analytics.genderBreakdown.homme > 0 || analytics.genderBreakdown.femme > 0) {
    calculable.push("K_718", "K_719"); // Répartition par genre
  }

  return calculable;
};

export default { getDsnAnalytics, getCalculableQuestions };