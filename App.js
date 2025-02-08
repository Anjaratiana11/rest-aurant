import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SignupScreen from "./src/screens/SignupScreen";
import PlatsScreen from "./src/screens/PlatsScreen";
import PlatDetailsScreen from "./src/screens/PlatDetailsScreen";
import CommandeScreen from "./src/screens/CommandeScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignupScreen">
        <Stack.Screen
          name="SignupScreen"
          component={SignupScreen}
          options={{ title: "Inscription" }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ title: "Connexion" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Accueil" }}
        />
        <Stack.Screen
          name="PlatsScreen"
          component={PlatsScreen}
          options={{ title: "Liste des Plats" }}
        />
        <Stack.Screen
          name="PlatDetailsScreen"
          component={PlatDetailsScreen}
          options={{ title: "Details du Plat" }}
        />
        <Stack.Screen
          name="CommandeScreen"
          component={CommandeScreen}
          options={{ title: "Commande" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
