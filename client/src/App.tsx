import { useAppNavigationStore } from "./stores/appNavigation.store";
import { DsnFileUpload } from "./components/DsnFileUpload/DsnFileUpload";
import { DsnForm } from "./components/DsnForm/DsnForm";
import { WordExport } from "./components/WordExport/WordExport";
import { ToastContainer } from "react-toastify";
import logoKiosk from "./assets/kiosk_logo.jpeg";
import styles from "./styles/App.module.scss";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { currentScreen } = useAppNavigationStore();

  // Render the appropriate screen based on navigation state
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "upload":
        return <DsnFileUpload />;
      case "form":
        return <DsnForm />;
      case "export":
        return <WordExport />;
      default:
        console.warn(`Unknown screen: ${currentScreen}, fallback to upload`);
        return <DsnFileUpload />;
    }
  };

  return (
    <div className={styles.mainContainer}>
      <header className={styles.heroHeader}>
        <div className={styles.heroContent}>
          <div className={styles.brandContainer}>
            <img src={logoKiosk} alt="Kiosk" className={styles.logo} />
            <div className={styles.titleGroup}>
              <h1>DSN Mapper</h1>
              <p>Test Lead Dev Amar Bouabbache</p>
            </div>
          </div>
        </div>
      </header>
      <main className={styles.contentArea}>{renderCurrentScreen()}</main>

      {/* Toast notifications container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
