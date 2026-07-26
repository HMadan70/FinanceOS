import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { signup } from "../api";
import { colors, spacing, radius, fonts, shadow } from "../theme";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    setMessage("");
    try {
      await signup(email, password, username);
      setMessage("Account created! You can now log in.");
      router.replace("/");
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>Create Account</Text>
        <Text style={styles.subtitle}>Join FinanceOS</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.muted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/")}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    padding: spacing.s4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.s6,
    ...shadow.card,
  },
  brand: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.s1,
    marginBottom: spacing.s6,
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.neutral100,
    borderRadius: radius.md,
    padding: spacing.s3,
    marginBottom: spacing.s3,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.accent,
    padding: spacing.s3,
    borderRadius: radius.lg,
    alignItems: "center",
    marginTop: spacing.s2,
  },
  buttonText: {
    fontFamily: fonts.bodySemibold,
    color: colors.white,
    fontSize: 16,
  },
  link: {
    fontFamily: fonts.body,
    color: colors.accent,
    textAlign: "center",
    marginTop: spacing.s4,
  },
  message: {
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: spacing.s4,
    color: colors.text,
  },
});