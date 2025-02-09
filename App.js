import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync, sendPushNotification } from "./src/services/NotificationService";

// Importation des écrans
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SignupScreen from "./src/screens/SignupScreen";
import PlatsScreen from "./src/screens/PlatsScreen";
import PlatDetailsScreen from "./src/screens/PlatDetailsScreen";
import CommandeScreen from "./src/screens/CommandeScreen";
import PayerScreen from "./src/screens/PayerScreen";

const Stack = createStackNavigator();

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Enregistrement des notifications push
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    // Écouteur de réception de notification
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification reçue:", notification);
      }
    );

    // Écouteur de réponse à la notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Réponse à la notification:", response);
      }
    );

    // Nettoyage des écouteurs lors du démontage du composant
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ title: "Inscription" }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: "Connexion" }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Accueil" }} />
        <Stack.Screen name="PlatsScreen" component={PlatsScreen} options={{ title: "Liste des Plats" }} />
        <Stack.Screen name="PlatDetailsScreen" component={PlatDetailsScreen} options={{ title: "Détails du Plat" }} />
        <Stack.Screen name="CommandeScreen" component={CommandeScreen} options={{ title: "Commande" }} />
        <Stack.Screen name="PayerScreen" component={PayerScreen} options={{ title: "Payer" }} />
      </Stack.Navigator>

      {/* Ajout d'un bouton de test des notifications */}
      <View style={{ alignItems: "center", marginVertical: 10 }}>
        <Text>Expo Push Token:</Text>
        <Text selectable>{expoPushToken}</Text>
        <Button title="Envoyer une notification test" onPress={() => sendPushNotification(expoPushToken)} />
      </View>
    </NavigationContainer>
  );
}