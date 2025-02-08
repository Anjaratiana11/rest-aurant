import { useEffect } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Configuration Firebase
const firebaseConfig = require("../../config/google-services.json"); // Assure-toi que ce fichier existe et contient tes clés Firebase

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Fonction pour obtenir le token FCM
export const getPushToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey:
        "BITXKAHEd8glrswJFi7G4DyE5HSVLIkHSVSpCN_qcecl32AsnQ_-GTqUR8BtmQoGPkFzj1HsLhvRlKwbcAlw06M", // Remplace par ta clé VAPID si nécessaire
    });
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Erreur lors de la récupération du token FCM:", error);
  }
};

// Fonction pour écouter les notifications en avant-plan
export const onNotificationReceived = () => {
  onMessage(messaging, (payload) => {
    console.log("Notification reçue en avant-plan:", payload);
    Notifications.scheduleNotificationAsync({
      content: {
        title: payload.notification?.title || "Nouvelle notification",
        body: payload.notification?.body || "Vous avez un nouveau message",
      },
      trigger: null, // Affiche immédiatement
    });
  });
};

// Fonction principale pour configurer les notifications push
export const configurePushNotifications = () => {
  useEffect(() => {
    // Demander la permission
    (async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          await Notifications.requestPermissionsAsync();
        }
      }
    })();

    // Obtenir le token
    getPushToken();

    // Écouter les notifications reçues en avant-plan
    onNotificationReceived();
  }, []);
};
