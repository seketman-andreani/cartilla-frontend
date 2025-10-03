import { useEffect, useState } from "react";

import styles from "./styles/appStyles";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const fetchUser = (jwtToken) => {
    fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error === "token_expired") {
          refreshToken();
        } else if (!data.error) {
          setUser(data);
        }
      });
  };

  const refreshToken = () => {
    fetch(`${API_URL}/refresh`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          fetchUser(data.token);
        }
      });
  };

  useEffect(() => {
    // Obtener token de query param si existe
    const params = new URLSearchParams(window.location.search);
    const newToken = params.get("token");

    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      window.history.replaceState({}, "", "/dashboard");
    }

    if (token) {
      fetchUser(token);
    }
  }, [token]);

  const handleLogin = (os_key) => {
    window.location.href = `${API_URL}/login/${os_key}`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    window.location.href = "/";
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.left}>
          <div style={styles.title}>
            CartillaIA <span style={styles.titleMeta}>— OpenDev Pro</span>
          </div>
          <div style={styles.subtitle}>Aplicación multitenant para gestión de cartillas y autorizaciones</div>

          {!user ? (
            <>
              <p style={styles.description}>
                Inicia sesión con Microsoft usando la cuenta correspondiente a tu proveedor de autenticación.
                Selecciona la opción adecuada para continuar.
              </p>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => handleLogin("medife")}
                  style={styles.btnPrimary}
                  aria-label="Iniciar sesión Medifé"
                >
                  <span style={styles.btnIcon}>🏥</span>
                  Iniciar sesión Medifé
                </button>

                <button
                  type="button"
                  onClick={() => handleLogin("osde")}
                  style={styles.btnSecondary}
                  aria-label="Iniciar sesión OSDE u otros"
                >
                  <span style={styles.btnIcon}>🔒</span>
                  Iniciar sesión Otros
                </button>
              </div>

              <div style={styles.footer}>
                <div>¿Problemas para iniciar sesión? Contacta con tu administrador.</div>
                <div style={{ marginTop: 8 }}><small style={styles.small}>OpenDev Pro — CartillaIA</small></div>
              </div>
            </>
          ) : (
            <div>
              <h2 style={styles.welcomeTitle}>Bienvenido {user.name || user.email}</h2>
              <div style={{ marginTop: 12, ...styles.profileBox }}>
                <pre style={styles.pre}>{JSON.stringify(user, null, 2)}</pre>
              </div>
              <div style={{ marginTop: 12 }}>
                <button onClick={logout} style={styles.btnSecondary}>Cerrar sesión</button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.right}>
          <div style={{ textAlign: "right" }}>
            <div style={styles.secureTitle}>Acceso seguro</div>
            <div style={styles.secureDesc}>
              Autenticación via Microsoft OAuth.<br />
              Tus credenciales no son almacenadas por CartillaIA.
            </div>
          </div>

          <div style={{ marginTop: "auto", textAlign: "right" }}>
            <div style={styles.copy}>© {new Date().getFullYear()} OpenDev Pro</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
