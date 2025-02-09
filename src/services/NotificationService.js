import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import axios from "axios";
import { getCommandeActuelle} from "./SymfonyService";

const API_URL = "https://cuisine-qemt.onrender.com/api";

/**
 * Demande la permission pour les notifications push et récupère le token Expo.
 */
export async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== "granted") {
      alert("Permission de notifications refusée !");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
  } else {
    alert("Les notifications push ne sont pas supportées sur cet appareil.");
  }
  
  return token;
}

/**
 * Envoie une notification push à l'utilisateur.
 */
export async function sendPushNotification(expoPushToken, message) {
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: "default",
      title: "Commande prête !",
      body: message,
      data: { action: "commande_prete" },
    }),
  });
}

/**
 * Vérifie si une commande de l'utilisateur est prête (statut 2) et envoie une notification.
 */
export async function checkAndSendNotification(userId, expoPushToken) {
  try {
    console.log("📡 Vérification des commandes pour userId:", userId);

    // Récupère l'ID de la commande actuelle
    const idCommande = await getCommandeActuelle(userId);

    if (!idCommande) {
      console.log("⏳ Aucune commande en cours.");
      return;
    }
    console.log("🔍 ID de la commande actuelle:", idCommande);

    // Récupère les détails de la commande
    let detailsCommandeResponse;
    try {
      detailsCommandeResponse = await axios.get(`${API_URL}/commande/${idCommande}/detailsCommande`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("⚠️ Aucun détail de commande trouvé. (Pas encore de plats ajoutés)");
        return;
      } else {
        throw error; // Si ce n'est pas une erreur 404, on relance l'erreur
      }
    }

    // Vérifie si des détails existent
    if (!detailsCommandeResponse.data || detailsCommandeResponse.data.length === 0) {
      console.log("⚠️ Aucun plat trouvé pour cette commande.");
      return;
    }

    // Filtre les plats prêts
    const platsPrets = detailsCommandeResponse.data.filter((item) => item.statut === 2);
    console.log("🍽 Plats prêts détectés:", platsPrets);

    if (platsPrets.length === 0) {
      console.log("⏳ Aucun plat prêt pour notification.");
      return;
    }

    // Récupère le nom du premier plat prêt
    const platResponse = await axios.get(`${API_URL}/plat/${platsPrets[0].idPlat}`);
    const nomPlat = platResponse.data[0]?.nom || "Plat inconnu";
    console.log("🍕 Nom du plat prêt:", nomPlat);

    // Envoie une notification push
    console.log("🚀 Envoi de la notification...");
    await sendPushNotification(expoPushToken, `Votre plat "${nomPlat}" est prêt !`);
    console.log("✅ Notification envoyée avec succès.");

    // Change le statut des plats à 3 après notification
    for (const detail of platsPrets) {
      await axios.put(`${API_URL}/detailsCommande/${detail.id}/recu`);
      console.log(`🔄 Statut de ${detail.id} mis à jour à 3.`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification des commandes:", error.response?.data || error.message);
  }
}




