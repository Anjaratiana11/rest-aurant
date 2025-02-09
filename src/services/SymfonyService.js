import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://cuisine-qemt.onrender.com/api";

/**
 * Récupère la liste des plats depuis l'API Symfony.
 */
const getPlats = async () => {
  try {
    const response = await axios.get(`${API_URL}/plats`);
    const data = response.data;

    // Vérification de la structure des données
    if (
      Array.isArray(data) &&
      data.every(
        (item) => item.id && item.nom && item.tempsDePreparation !== undefined
      )
    ) {
      return data;
    } else {
      throw new Error(
        "Données mal formées : un ou plusieurs plats sont manquants."
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des plats:", error);
    throw new Error("Impossible de récupérer les plats");
  }
};


const getPlatDetails = async (platId) => {
  try {
    const response = await axios.get(`${API_URL}/plat/${platId}`);
    const data = response.data;


    if (Array.isArray(data) && data.length > 0) {
      const plat = data[0]; // Accède au premier objet dans le tableau

      // Vérifie que l'objet contient les propriétés id et nom
      if (plat.id && plat.nom) {
        return plat;
      } else {
        throw new Error("Plat non trouvé ou données mal formées");
      }
    } else {
      throw new Error("Plat non trouvé ou données mal formées");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du plat:", error);
    throw new Error("Impossible de récupérer les détails du plat");
  }
};

/**
 * Récupère les ingrédients d'un plat par son ID.
 */
const getPlatsIngredients = async (platId) => {
  try {
    const response = await axios.get(`${API_URL}/plats/${platId}/ingredients`);
    const ingredientsIds = response.data;

    if (Array.isArray(ingredientsIds)) {
      return ingredientsIds;
    } else {
      throw new Error("Ingrédients mal formés");
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des ingrédients du plat:",
      error
    );
    throw new Error("Impossible de récupérer les ingrédients du plat");
  }
};

/**
 * Récupère les détails d'un ingrédient par son ID.
 */
const getIngredientDetails = async (ingredientId) => {
  try {
    const response = await axios.get(`${API_URL}/ingredient/${ingredientId}`);
    const data = response.data;

    if (Array.isArray(data) && data[0] && data[0].nom) {
      return data[0];
    } else {
      throw new Error("Ingrédient non trouvé ou données mal formées");
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de l'ingrédient:",
      error
    );
    throw new Error("Impossible de récupérer les détails de l'ingrédient");
  }
};
/**
 * Récupère l'ID de la commande actuelle de l'utilisateur.
 */
const getCommandeActuelle = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/utilisateur/${userId}/commandeActu`
    );
    return response.data.idCommande; // Récupère l'ID de la commande
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la commande actuelle:",
      error
    );
    throw new Error("Impossible de récupérer la commande actuelle");
  }
};

const ajouterPlatCommande = async (idCommande, idPlat, quantite) => {
  try {
    const response = await axios.post(`${API_URL}/detailsCommande/multi`, {
      idCommande,
      idPlat,
      quantite,
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout du plat à la commande:", error);
    throw new Error("Impossible d'ajouter le plat à la commande");
  }
};

/**
 * Récupère les détails de la commande par son ID.
 */
const getCommandeDetails = async (idCommande) => {
  try {
    const response = await axios.get(
      `${API_URL}/commande/${idCommande}/detailsCommande` 
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de la commande:",
      error
    );
    throw new Error("Impossible de récupérer la commande");
  }
};

export const validerCommande = async (idCommande) => {
  try {
    const response = await fetch(`${API_URL}/paiement/${idCommande}/valider`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Lire la réponse brute
    const text = await response.text();
    console.log("Réponse brute de l'API :", text);

    // Vérifier si la réponse est bien un JSON avant de la parser
    try {
      const data = JSON.parse(text);
      if (response.ok) {
        return data;
      } else {
        throw new Error(
          data.message || "Erreur lors de la validation de la commande"
        );
      }
    } catch (jsonError) {
      throw new Error("La réponse de l'API n'est pas un JSON valide.");
    }
  } catch (error) {
    console.error("Erreur dans validerCommande:", error);
    throw new Error(
      error.message || "Erreur inconnue lors de la validation de la commande"
    );
  }
};

export const deleteDetailCommande = async (idDetail) => {
  try {
    const response = await fetch(`${API_URL}/detailsCommande/${idDetail}`, {
      method: "DELETE",
    });

    // Vérifie si la réponse a un statut OK
    if (!response.ok) {
      throw new Error("Échec de la suppression du plat");
    }

    // Si la réponse est vide, retourne une réponse vide ou une confirmation
    const data = await response.text();
    if (!data) {
      return { statut: 0, message: "Plat supprimé avec succès." };
    }

    // Parse la réponse JSON si elle est disponible
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    throw new Error(error.message || "Erreur lors de la suppression du plat");
  }
};

// Service pour récupérer le prix d'un plat
export const getPrixPlat = async (idPlat) => {
  try {
    const response = await axios.get(`${API_URL}/plat/${idPlat}/prix`);
    return response.data.montant;
  } catch (error) {
    console.error("Erreur lors de la récupération du prix du plat", error);
    throw error;
  }
};

// Service pour récupérer la somme d'une commande
export const getSommeCommande = async (idCommande) => {
  try {
    const response = await axios.get(`${API_URL}/commande/${idCommande}/total`);
    return response.data.total;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du total de la commande",
      error
    );
    throw error;
  }
};



export const preparerCommande = async (idCommande) => {
  try {
    const response = await axios.post(`${API_URL}/commande/${idCommande}/prepare`);

    if (response.data && response.data.message) {
      console.log(response.data.message);
      return response.data;
    } else {
      throw new Error("Réponse inattendue de l'API lors de la préparation de la commande");
    }
  } catch (error) {
    console.error("Erreur lors de la préparation de la commande:", error);
    throw new Error("Impossible de préparer la commande");
  }
};

export const getStatusColor = (statut) => { 
  switch (statut) {
    case -1:
      return "gray";  // Gris pour panier
    case 0:
      return "orange";  // Orange pour en préparation
    case 1:
      return "green";  // Vert pour livré
    default:
      return "black";  // Noir pour statut inconnu
  }
};

export const inscrireUtilisateur = async (nom, nomUtilisateur, mdp, mail) => {
  try {
    const response = await axios.post(`${API_URL}/signIn`, {
      nom,
      nomUtilisateur,
      mdp,
      mail,
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    throw new Error("Impossible de s'inscrire");
  }
};

export const connexionUtilisateur = async (mail, mdp) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      mail, // Utiliser "mail" au lieu de "nomUtilisateur"
      mdp,
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    throw new Error("Impossible de se connecter");
  }
};


export const deconnexionUtilisateur = async () => {
  try {
    // Supprimer l'ID utilisateur de AsyncStorage
    await AsyncStorage.removeItem("userId");
    console.log("Utilisateur déconnecté");

    // Rediriger vers la page de connexion
    navigation.navigate("LoginScreen");
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
  }
};
export {
  getPlats,
  getPlatDetails,
  getPlatsIngredients,
  getIngredientDetails,
  getCommandeActuelle,
  ajouterPlatCommande,
  getCommandeDetails,
};