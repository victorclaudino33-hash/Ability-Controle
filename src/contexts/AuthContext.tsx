import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/collections";
import type { Usuario, UsuarioAutenticado } from "@/types/auth";

interface AuthContextValue {
  /** Usuário do Firebase Auth (dados brutos de autenticação) */
  firebaseUser: User | null;
  /** Usuário resolvido com perfil/base vindos do Firestore */
  usuario: UsuarioAutenticado | null;
  /** true enquanto ainda não sabemos o estado de autenticação */
  carregando: boolean;
  /** Erro amigável de login, se houver */
  erro: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapErroFirebase(codigo: string): string {
  switch (codigo) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "auth/user-disabled":
      return "Este usuário está desativado. Contate o administrador.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setUsuario(null);
        setCarregando(false);
        return;
      }

      try {
        const ref = doc(db, COLLECTIONS.USUARIOS, user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          // Autenticado no Firebase Auth, mas sem cadastro em "usuarios" -> sem perfil definido
          setUsuario(null);
          setErro("Seu usuário não possui cadastro de perfil. Contate o administrador.");
          setCarregando(false);
          return;
        }

        const dados = snap.data() as Usuario;

        if (dados.status === "inativo") {
          setErro("Este usuário está desativado. Contate o administrador.");
          setUsuario(null);
          await signOut(auth);
          return;
        }

        setUsuario({ ...dados, emailVerificado: user.emailVerified });
      } catch {
        setErro("Não foi possível carregar os dados do usuário.");
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    });

    return unsubscribe;
  }, []);

  async function login(email: string, senha: string) {
    setErro(null);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (err) {
      const codigo = (err as { code?: string })?.code ?? "";
      const mensagem = mapErroFirebase(codigo);
      setErro(mensagem);
      throw new Error(mensagem);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, usuario, carregando, erro, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
