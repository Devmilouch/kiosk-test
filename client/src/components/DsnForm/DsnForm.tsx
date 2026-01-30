import React, { useMemo } from "react";
import { useDsnUploadStore } from "../../stores/dsnUpload.store";
import { useAppNavigationStore } from "../../stores/appNavigation.store";
import { parseCSVQuestions, QUESTIONS_CSV, type FormQuestion } from "../../utils/csvParser";
import styles from "./DsnForm.module.scss";

export const DsnForm = () => {
  const {
    parsedDsnData,
    getEmployeeCount,
    getEmployeeCountByGender,
    getTotalRemunerationAmount,
    setUserAnswer,
    getUserAnswer,
  } = useDsnUploadStore();

  const { navigateToUpload, navigateToExport } = useAppNavigationStore();

  // Parse questions from CSV
  const questions = useMemo(() => parseCSVQuestions(QUESTIONS_CSV), []);

  if (!parsedDsnData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>❌ Aucune donnée DSN disponible</h2>
          <p>Veuillez d'abord télécharger un fichier DSN.</p>
          <button onClick={navigateToUpload} className={styles.backButton}>
            ← Retour à l'upload
          </button>
        </div>
      </div>
    );
  }

  // Auto-calculate answers from DSN data
  const getCalculatedAnswer = (questionId: string): string | number => {
    const totalEmployees = getEmployeeCount();
    const genderCounts = getEmployeeCountByGender();

    switch (questionId) {
      case "S1-6_02":
      case "S1-6_03":
        return totalEmployees;

      case "K_718": // Hommes
        return genderCounts.homme;

      case "K_719": // Femmes
        return genderCounts.femme;

      // Supprimer les valeurs en dur - ne pas remplir si on ne peut pas calculer
      default:
        return "";
    }
  };

  const updateAnswer = (questionId: string, value: string | number) => {
    setUserAnswer(questionId, value);
  };

  const getCurrentAnswer = (questionId: string): string | number => {
    // User override has priority
    const userAnswer = getUserAnswer(questionId);
    if (userAnswer !== undefined) {
      return userAnswer;
    }
    // Otherwise use calculated value
    return getCalculatedAnswer(questionId);
  };

  const renderFormField = (question: FormQuestion): React.JSX.Element => {
    const currentAnswer = getCurrentAnswer(question.id);

    switch (question.content) {
      case "number":
        return (
          <div className={styles.fieldContainer}>
            <input
              type="number"
              value={currentAnswer}
              onChange={e => updateAnswer(question.id, parseFloat(e.target.value) || 0)}
              className={styles.numberInput}
            />
            {question.unit && <span className={styles.unit}>{question.unit}</span>}
          </div>
        );

      case "text":
        return (
          <textarea
            value={currentAnswer}
            onChange={e => updateAnswer(question.id, e.target.value)}
            className={styles.textArea}
            rows={3}
          />
        );

      case "enum": {
        const options = question.enumFr ? question.enumFr.split(", ") : [];
        return (
          <select
            value={currentAnswer}
            onChange={e => updateAnswer(question.id, e.target.value)}
            className={styles.selectInput}
          >
            <option value="">-- Sélectionner --</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }

      case "table":
        return <div className={styles.tableContainer}>📋 Table: {question.questionLabelFr}</div>;

      default: // Empty content - just a title/section
        return <div className={styles.sectionTitle}>{question.questionLabelFr}</div>;
    }
  };

  const renderQuestion = (question: FormQuestion): React.JSX.Element => {
    const isTable = question.content === "table";
    const hasChildren = question.children.length > 0;
    const isTitle = question.content === "";

    return (
      <div
        key={question.id}
        className={`${styles.questionContainer} ${styles[`level-${question.level}`]}`}
      >
        {isTitle && (
          <div className={styles.titleSection}>
            <h3 className={styles.sectionHeader}>{question.questionLabelFr}</h3>
          </div>
        )}

        {isTable && (
          <div className={styles.tableSection}>
            <h4 className={styles.tableHeader}>{question.questionLabelFr}</h4>
            <div className={styles.tableRows}>
              {question.children.map(child => (
                <div key={child.id} className={styles.tableRow}>
                  <div className={styles.rowLabel}>
                    <label className={styles.questionLabel}>
                      <span className={styles.questionId}>{child.id}</span>
                      {child.questionLabelFr}
                    </label>
                  </div>
                  <div className={styles.rowField}>{renderFormField(child)}</div>
                  <div className={styles.calculationInfo}>
                    <small>Calculé depuis données DSN</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isTable && !isTitle && (
          <div className={styles.fieldSection}>
            <label className={styles.questionLabel}>
              <span className={styles.questionId}>{question.id}</span>
              {question.questionLabelFr}
            </label>
            {renderFormField(question)}
            <div className={styles.calculationInfo}>
              <small>
                {getCurrentAnswer(question.id) !== ""
                  ? "Calculé depuis données DSN"
                  : "Données non disponibles dans le DSN"}
              </small>
            </div>
          </div>
        )}

        {/* Render non-table children */}
        {hasChildren && !isTable && (
          <div className={styles.childrenContainer}>{question.children.map(renderQuestion)}</div>
        )}
      </div>
    );
  };

  const handleExport = () => {
    const exportData = {
      questions: questions.map(q => ({
        id: q.id,
        question: q.questionLabelFr,
        answer: getCurrentAnswer(q.id),
        children: q.children?.map(child => ({
          id: child.id,
          question: child.questionLabelFr,
          answer: getCurrentAnswer(child.id),
        })),
      })),
      summary: {
        totalEmployees: getEmployeeCount(),
        genderBreakdown: getEmployeeCountByGender(),
        totalRemuneration: getTotalRemunerationAmount(),
      },
    };

    console.log("Données d'export:", exportData);
    navigateToExport();
  };

  const totalEmployees = getEmployeeCount();
  const genderCounts = getEmployeeCountByGender();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📋 Formulaire CSRD - Section S1-6</h1>
        <p>Questions sur les employés basées sur les données DSN</p>
      </header>

      <div className={styles.dsnSummary}>
        <h3>📊 Résumé des données DSN</h3>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <strong>Total employés:</strong> {totalEmployees}
          </div>
          <div className={styles.summaryCard}>
            <strong>Hommes:</strong> {genderCounts.homme}
          </div>
          <div className={styles.summaryCard}>
            <strong>Femmes:</strong> {genderCounts.femme}
          </div>
          <div className={styles.summaryCard}>
            <strong>Total rémunérations:</strong> {getTotalRemunerationAmount().toLocaleString()} €
          </div>
        </div>
      </div>

      <div className={styles.formSection}>{questions.map(renderQuestion)}</div>

      <div className={styles.actions}>
        <button onClick={navigateToUpload} className={styles.backButton}>
          ← Nouveau fichier DSN
        </button>
        <button onClick={handleExport} className={styles.exportButton}>
          📄 Exporter vers Word
        </button>
      </div>

      <div className={styles.debugSection}>
        <details>
          <summary>
            <strong>🔍 Structure des questions (debug)</strong>
          </summary>
          <pre>
            {JSON.stringify(
              questions.slice(0, 3).map(q => ({
                id: q.id,
                label: q.questionLabelFr,
                content: q.content,
                level: q.level,
                childrenCount: q.children.length,
                children: q.children.map(c => ({
                  id: c.id,
                  label: c.questionLabelFr,
                  content: c.content,
                })),
              })),
              null,
              2
            )}
          </pre>
        </details>
      </div>
    </div>
  );
};
