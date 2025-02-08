import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


const API_KEY = "AIzaSyDXw-PqZrNfGI1oUBYCjKGE3DL81tRSSqQ";


const signup = async (email, password) => {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );

    const idToken = response.data.idToken;

    // Stocke le token dans AsyncStorage
    await AsyncStorage.setItem("idToken", idToken);

    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'inscription", error.response?.data);
    throw new Error(error.response?.data?.error?.message || "Erreur inconnue");
  }
};

const login = async (email, password) => {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );

    console.log("Réponse de la connexion :", response.data);

    const idToken = response.data.idToken;

    // Stocke le token dans AsyncStorage
    await AsyncStorage.setItem("idToken", idToken);

    return { idToken }; // Retourne l'idToken directement
  } catch (error) {
    console.error("Erreur lors de la connexion", error.response?.data);
    throw new Error(error.response?.data?.error?.message || "Erreur inconnue");
  }
};


// Fonction pour récupérer le token stocké
const getToken = async () => {
  return await AsyncStorage.getItem("idToken");
};

// Fonction pour supprimer le token (déconnexion)
const logout = async () => {
  await AsyncStorage.removeItem("idToken");
};

export { signup, login, getToken, logout };