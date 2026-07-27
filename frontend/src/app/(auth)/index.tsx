import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { login, getMe } from "../../api";
import { saveTokens } from "../../auth";
import { colors, spacing, radius, fonts, shadow } from "../../theme";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  // Tracks the whole login + profile-check sequence, so the button can show
  // progress and can't be pressed twice.
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    setMessage("");
    setBusy(true);
    try {
      const data = await login(email, password);
      await saveTokens(data.access_token, data.refresh_token);

      // Tokens alone don't tell us whether this user has onboarded, so ask the
      // backend. This is awaited *before* any navigation happens — that's what
      // prevents a flash of the wrong screen. The user stays on the login
      // screen (with the button reading "Checking...") until we know where to
      // send them, so we never render tabs and then bounce them to onboarding.
      const me = await getMe();

      if (me.has_completed_onboarding) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    } catch (error: any) {
      setMessage(error.message);
      // Only reset on failure: a successful login navigates away and unmounts
      // this screen, so there'd be no component left to re-enable.
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>FinanceOS</Text>
        <Text style={styles.subtitle}>Welcome back</Text>

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
          onPress={handleLogin}
          disabled={busy}
        >
          <Text style={styles.buttonText}>
            {busy ? "Checking..." : "Log In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/signup")}>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
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
    fontSize: 32,
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