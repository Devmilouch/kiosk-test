import { useDropzone } from "react-dropzone";
import type { FileRejection } from "react-dropzone";
import { z } from "zod";
import axios from "axios";
import { useDsnUploadStore } from "../../stores/dsnUpload.store";
import { useAppNavigationStore } from "../../stores/appNavigation.store";
import styles from "./DsnFileUpload.module.scss";

// Zod validation (same logic as backend)
const fileSchema = z.object({
  name: z
    .string()
    .regex(/^[^<>:"/\\|?*]+\.txt$/i, "Veuillez sélectionner un fichier .txt uniquement"),
  size: z
    .number()
    .min(1, "Le fichier ne peut pas être vide")
    .max(10 * 1024 * 1024, "La taille du fichier doit être inférieure à 10 Mo"),
});

export const DsnFileUpload = () => {
  const {
    selectedFile,
    isUploading,
    error,
    setSelectedFile,
    clearError,
    reset,
    setUploading,
    setUploadedFile,
    setError,
  } = useDsnUploadStore();
  const { setScreen } = useAppNavigationStore();

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    clearError();

    // Handle files rejected by react-dropzone
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors?.[0]?.code === "file-invalid-type") {
        console.error("File type validation failed:", rejection.errors[0]);
        return; // react-dropzone already handles error display
      }
      console.error("File validation failed:", rejection.errors);
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Additional validation with Zod
    const result = fileSchema.safeParse({
      name: file.name,
      size: file.size,
    });

    if (!result.success) {
      console.error("Zod validation failed:", result.error.issues);
      return; // Errors are handled by react-dropzone
    }

    console.log("File selected successfully:", file.name);
    setSelectedFile(file);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    accept: { "text/plain": [".txt"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isUploading,
    onDrop,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    console.log("Starting file upload...");
    setUploading(true);
    clearError();

    try {
      const formData = new FormData();
      formData.append("dsn", selectedFile);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/dsn/parse`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload successful:", response.data);

      // Store the result in the store for next screens
      setUploadedFile({
        name: response.data.filename,
        size: response.data.size,
        content: response.data.content,
      });

      setScreen("form");
    } catch (error) {
      console.error("Upload failed:", error);

      if (axios.isAxiosError(error) && error.response) {
        const serverError = error.response.data;
        setError(serverError.details || serverError.error || "Erreur lors du téléchargement");
      } else {
        setError("Erreur de connexion au serveur");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    console.log("Resetting file selection");
    reset();
  };

  // Validation error message
  const validationError = fileRejections[0]?.errors[0]?.message;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Télécharger un fichier DSN</h2>
        <p>Glissez-déposez un fichier DSN (.txt) ou cliquez pour le sélectionner</p>
      </div>

      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ""} ${
          isDragReject ? styles.dragReject : ""
        } ${isUploading ? styles.disabled : ""}`}
      >
        <input {...getInputProps()} />

        {!selectedFile && (
          <div className={styles.uploadPrompt}>
            <div className={styles.uploadIcon}>
              {isDragActive ? (isDragReject ? "❌" : "📤") : "📄"}
            </div>
            <div className={styles.uploadText}>
              {isDragActive ? (
                isDragReject ? (
                  "Fichier non supporté"
                ) : (
                  "Déposez le fichier ici"
                )
              ) : (
                <>
                  <strong>Cliquez pour choisir</strong> ou glissez un fichier DSN (.txt)
                </>
              )}
            </div>
            <div className={styles.uploadHint}>Taille maximale : 10 Mo</div>
          </div>
        )}

        {selectedFile && (
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>{selectedFile.name}</div>
            <div className={styles.fileSize}>{(selectedFile.size / 1024).toFixed(1)} Ko</div>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className={styles.fileActions}>
          <button onClick={handleUpload} disabled={isUploading} className={styles.uploadButton}>
            {isUploading ? "Téléchargement..." : "Télécharger et analyser"}
          </button>
          <button onClick={handleReset} disabled={isUploading} className={styles.resetButton}>
            Réinitialiser
          </button>
        </div>
      )}

      {isUploading && (
        <div className={styles.progress}>
          <div className={styles.progressText}>Téléchargement en cours...</div>
        </div>
      )}

      {(error || validationError) && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          {error || validationError}
        </div>
      )}
    </div>
  );
};
