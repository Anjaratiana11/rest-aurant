import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button,Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync, checkAndSendNotification } from "./src/services/NotificationService";

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
 
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,  // Permet d'afficher une alerte
      shouldPlaySound: true,  // Active le son de la notification
      shouldSetBadge: true,   // Active le badge sur l'icône de l'application
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function init() {
      const token = await registerForPushNotificationsAsync();
      if (token) setExpoPushToken(token);

      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
        checkAndSendNotification(storedUserId, token);
      }
    }
    init();
    

    // Écouteur pour la réception des notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification reçue:", notification);
      }
    );

    // Écouteur pour la réponse aux notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log("Réponse à la notification:", response);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []); 

  useEffect(() => {
    if (userId && expoPushToken) {
      const interval = setInterval(() => {
        console.log("🔄 Vérification des nouvelles commandes...");
        checkAndSendNotification(userId, expoPushToken);
      }, 10000); // Vérifie toutes les 10 secondes
  
      return () => clearInterval(interval); // Nettoie l'intervalle à la fermeture de l'app
    }
  }, [userId, expoPushToken]);

  return (
    <NavigationContainer>
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerStyle: { backgroundColor: "hsl(337, 53%, 85%)" },
        headerTintColor: "#333",
        headerRight: () => (
          <Image
            source={require("./src/assets/images/logo2.png")}
            style={{ width: 40, height: 40, marginRight: 10 }}
          />
        ),
      }}
    >
      <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ title: "Inscription" }} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: "Connexion" }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Accueil" }} />
      <Stack.Screen name="PlatsScreen" component={PlatsScreen} options={{ title: "Liste des Plats" }} />
      <Stack.Screen name="PlatDetailsScreen" component={PlatDetailsScreen} options={{ title: "Détails du Plat" }} />
      <Stack.Screen name="CommandeScreen" component={CommandeScreen} options={{ title: "Commande" }} />
      <Stack.Screen name="PayerScreen" component={PayerScreen} options={{ title: "Payer" }} />
    </Stack.Navigator>
  </NavigationContainer>
  

  );
}
