import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { signup, login } from "../../api";
import { saveTokens } from "../../auth";
import { colors, spacing, radius, fonts, shadow } from "../../theme";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSignup = async () => {
    setMessage("");
    setBusy(true);
    try {
      await signup(email, password, username);

      // Registering doesn't return tokens, but the onboarding screen calls a
      // protected endpoint and needs one. So log in immediately with the same
      // credentials — the user never sees the login screen.
      const data = await login(email, password);
      await saveTokens(data.access_token, data.refresh_token);

      // A brand-new account always has has_completed_onboarding = false, so
      // unlike the login screen there's nothing to check — go straight there.
      router.replace("/onboarding");
    } catch (error: any) {
      setMessage(error.message);
      setBusy(false);
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

        <TouchableOpacity
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={busy}
        >
          <Text style={styles.buttonText}>
            {busy ? "Creating account..." : "Sign Up"}
          </Text>
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
  buttonDisabled: {
    backgroundColor: colors.neutral400,
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