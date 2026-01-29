import logoKiosk from "./assets/kiosk_logo.jpeg";
import styles from "./styles/App.module.scss";

function App() {
  return (
    <div className={styles.mainContainer}>
      <header className={styles.heroHeader}>
        <div className={styles.heroContent}>
          <div className={styles.brandContainer}>
            <img src={logoKiosk} alt="Kiosk" className={styles.logo} />
            <div className={styles.titleGroup}>
              <h1>DSN Mapper</h1>
              <p>Test Lead Dev Amar</p>
            </div>
          </div>
        </div>
      </header>
      <main className={styles.contentArea}>{/* Contenu */}</main>
    </div>
  );
}

export default App;
