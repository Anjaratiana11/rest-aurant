import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Configurer la gestion des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Fonction pour s'enregistrer aux notifications push
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert("Les notifications push ne fonctionnent pas sur un émulateur !");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Permission refusée pour les notifications !");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

// Fonction pour envoyer une notification test
export async function sendPushNotification(expoPushToken) {
  if (!expoPushToken) {
    console.log("Aucun token disponible !");
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Hello ! 🚀",
    body: "Ceci est une notification test sur Expo Go.",
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}
