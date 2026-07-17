import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Configuração do Firebase.
 * As chaves vêm de variáveis de ambiente (.env.local) — nunca hardcode credenciais.
 * Veja .env.example para a lista de variáveis necessárias.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Evita reinicializar o app em hot-reload (Vite HMR)
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

/**
 * App secundário do Firebase, usado exclusivamente para o admin criar novos usuários
 * (Firebase Auth) sem perder a própria sessão logada — criar um usuário com o SDK do
 * client sempre autentica automaticamente como o usuário recém-criado no app em que
 * o comando roda. Usando um app isolado (com persistência apenas em memória, nunca
 * salva em disco) e fazendo signOut nele logo em seguida, a sessão do admin no app
 * principal não é afetada. Veja usuarioService.ts.
 */
const appSecundario = getApps().some((a) => a.name === "secundario")
  ? getApp("secundario")
  : initializeApp(firebaseConfig, "secundario");

export const authSecundario = initializeAuth(appSecundario, {
  persistence: inMemoryPersistence,
});
