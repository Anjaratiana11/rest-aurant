import React from "react";
import { TextInput, StyleSheet } from "react-native";

const Input = ({ value, onChangeText, placeholder, secureTextEntry }) => {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#000"
      secureTextEntry={secureTextEntry} // Ajout de la propriété secureTextEntry
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "hsl(337, 53%, 85%)",
  },
});

export default Input;
