import { useAppNavigationStore } from "./stores/appNavigation.store";
import { DsnFileUpload } from "./components/DsnFileUpload/DsnFileUpload";
import logoKiosk from "./assets/kiosk_logo.jpeg";
import styles from "./styles/App.module.scss";

function App() {
  const { currentScreen } = useAppNavigationStore();

  // Render the appropriate screen based on navigation state
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "upload":
        return <DsnFileUpload />;
      case "form":
        return <div>TODO: Composant de formulaire DSN</div>;
      case "export":
        return <div>TODO: Composant d'export Word</div>;
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
    </div>
  );
}

export default App;
