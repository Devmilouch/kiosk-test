import { useState } from "react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
} from "docx";
import { saveAs } from "file-saver";
import { useDsnUploadStore } from "../../stores/dsnUpload.store";
import { useAppNavigationStore } from "../../stores/appNavigation.store";
import { parseCSVQuestions, QUESTIONS_CSV, type FormQuestion } from "../../utils/csvParser";
import styles from "./WordExport.module.scss";

export const WordExport = () => {
  const {
    parsedDsnData,
    getEmployeeCount,
    getEmployeeCountByGender,
    getTotalRemunerationAmount,
    getUserAnswer,
  } = useDsnUploadStore();

  const { navigateToForm, navigateToUpload } = useAppNavigationStore();

  const [isExporting, setIsExporting] = useState(false);

  if (!parsedDsnData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>❌ Aucune donnée disponible</h2>
          <p>Veuillez d'abord télécharger un fichier DSN et remplir le formulaire.</p>
          <button onClick={navigateToUpload} className={styles.backButton}>
            ← Retour à l'upload
          </button>
        </div>
      </div>
    );
  }

  // Auto-calculate answers from DSN data (same logic as DsnForm)
  const getCalculatedAnswer = (questionId: string): string | number => {
    // User override has priority
    const userAnswer = getUserAnswer(questionId);
    if (userAnswer !== undefined) {
      return userAnswer;
    }

    // Otherwise use calculated value
    const totalEmployees = getEmployeeCount();
    const genderCounts = getEmployeeCountByGender();

    switch (questionId) {
      case "S1-6_02":
      case "S1-6_03":
        return totalEmployees;
      case "K_718":
        return genderCounts.homme;
      case "K_719":
        return genderCounts.femme;
      // Supprimer les valeurs en dur - ne pas remplir si on ne peut pas calculer
      default:
        return "";
    }
  };

  const generateWordDocument = async () => {
    setIsExporting(true);

    try {
      const questions = parseCSVQuestions(QUESTIONS_CSV);
      const totalEmployees = getEmployeeCount();
      const genderCounts = getEmployeeCountByGender();
      const totalRemuneration = getTotalRemunerationAmount();

      // Create document sections
      const documentChildren: (Paragraph | Table)[] = [];

      // Header
      documentChildren.push(
        new Paragraph({
          text: "Rapport CSRD - Section S1-6 : Employés",
          heading: HeadingLevel.TITLE,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
          spacing: { after: 600 },
        }),
        new Paragraph({
          text: "Résumé exécutif",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );

      // Summary as formatted paragraphs instead of table
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "• Total employés : ", bold: true }),
            new TextRun({ text: totalEmployees.toString() })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Employés hommes : ", bold: true }),
            new TextRun({ text: genderCounts.homme.toString() })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Employés femmes : ", bold: true }),
            new TextRun({ text: genderCounts.femme.toString() })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Total rémunérations : ", bold: true }),
            new TextRun({ text: `${totalRemuneration.toLocaleString()} €` })
          ],
          spacing: { after: 400 }
        })
      );

      // Questions and answers section
      documentChildren.push(
        new Paragraph({
          text: "Questions et réponses détaillées",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 },
        })
      );

      // Process each question recursively
      const processQuestion = (
        question: FormQuestion,
        level: number = 0
      ): (Paragraph | Table)[] => {
        const elements: (Paragraph | Table)[] = [];

        if (question.content === "") {
          // Section title
          elements.push(
            new Paragraph({
              text: question.questionLabelFr,
              heading: level === 0 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            })
          );
        } else if (question.content === "table") {
          // Table header
          elements.push(
            new Paragraph({
              text: question.questionLabelFr,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 300, after: 100 },
            })
          );

          // Table with children
          if (question.children.length > 0) {
            const tableRows = [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Question")] }),
                  new TableCell({ children: [new Paragraph("ID")] }),
                  new TableCell({ children: [new Paragraph("Réponse")] }),
                  new TableCell({ children: [new Paragraph("Unité")] }),
                ],
              }),
            ];

            question.children.forEach(child => {
              const answer = getCalculatedAnswer(child.id);
              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(child.questionLabelFr)] }),
                    new TableCell({ children: [new Paragraph(child.id)] }),
                    new TableCell({ children: [new Paragraph(answer.toString())] }),
                    new TableCell({ children: [new Paragraph(child.unit || "-")] }),
                  ],
                })
              );
            });

            elements.push(new Table({ rows: tableRows }));
          }
        } else {
          // Regular question with answer
          const answer = getCalculatedAnswer(question.id);
          elements.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${question.id} - `, bold: true }),
                new TextRun({ text: question.questionLabelFr }),
                new TextRun({ text: ` : ${answer}${question.unit || ""}`, bold: true }),
              ],
              spacing: { after: 100 },
            })
          );
        }

        // Process children for non-table questions
        if (question.content !== "table") {
          question.children.forEach(child => {
            elements.push(...processQuestion(child, level + 1));
          });
        }

        return elements;
      };

      // Add all questions
      questions.forEach(question => {
        documentChildren.push(...processQuestion(question));
      });

      // Footer
      documentChildren.push(
        new Paragraph({
          text: "Méthodologie",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 },
        }),
        new Paragraph({
          text: "Ce rapport a été généré automatiquement à partir des données DSN (Déclaration Sociale Nominative) de l'entreprise. Les calculs sont basés sur les informations des employés présentes dans le fichier DSN fourni.",
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "Les données incluent les informations d'identité des employés, leurs contrats de travail, et les rémunérations versées durant la période de référence.",
          spacing: { after: 200 },
        })
      );

      // Create and save document
      const doc = new Document({
        sections: [
          {
            children: documentChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `Rapport_CSRD_S1-6_${new Date().toISOString().slice(0, 10)}.docx`;

      saveAs(blob, fileName);
    } catch (error) {
      console.error("Erreur lors de la génération du document Word:", error);
      alert("Erreur lors de la génération du document Word. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  };

  const questions = parseCSVQuestions(QUESTIONS_CSV);
  const totalEmployees = getEmployeeCount();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📄 Export Word</h1>
        <p>Génération du rapport CSRD au format Word</p>
      </header>

      <div className={styles.previewSection}>
        <h3>📊 Aperçu du rapport</h3>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <strong>Total questions:</strong> {questions.length}
          </div>
          <div className={styles.summaryCard}>
            <strong>Questions calculables:</strong>{" "}
            {
              questions.filter(q => {
                const flatQuestions = [q, ...q.children].flat();
                return flatQuestions.some(fq => getCalculatedAnswer(fq.id) !== "");
              }).length
            }
          </div>
          <div className={styles.summaryCard}>
            <strong>Total employés:</strong> {totalEmployees}
          </div>
          <div className={styles.summaryCard}>
            <strong>Total rémunérations:</strong> {getTotalRemunerationAmount().toLocaleString()} €
          </div>
        </div>

        <div className={styles.contentPreview}>
          <h4>Contenu du rapport :</h4>
          <ul>
            <li>Résumé exécutif avec indicateurs clés</li>
            <li>Questions et réponses organisées par sections</li>
            <li>Tableaux de données pour les questions complexes</li>
            <li>Méthodologie de calcul</li>
          </ul>
        </div>
      </div>

      <div className={styles.exportSection}>
        <div className={styles.exportCard}>
          <h4>Génération du document Word</h4>
          <p>
            Le document contiendra toutes les questions CSRD avec leurs réponses calculées
            automatiquement depuis les données DSN.
          </p>

          <button
            onClick={generateWordDocument}
            disabled={isExporting}
            className={styles.exportButton}
          >
            {isExporting ? "⏳ Génération en cours..." : "📄 Télécharger le rapport Word"}
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={navigateToForm} className={styles.backButton}>
          ← Retour au formulaire
        </button>
        <button onClick={navigateToUpload} className={styles.secondaryButton}>
          📁 Nouveau fichier DSN
        </button>
      </div>
    </div>
  );
};
