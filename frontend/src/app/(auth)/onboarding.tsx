import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { submitOnboarding } from "../../api";
import { colors, spacing, radius, fonts, shadow } from "../../theme";

const GOALS = [
  { value: "save_money", label: "Save money" },
  { value: "stick_to_budget", label: "Stick to a budget" },
  { value: "track_spending", label: "Just track spending" },
] as const;

const INCOMES = [
  { value: "under_50", label: "Under 50 BD" },
  { value: "under_100", label: "Under 100 BD" },
  { value: "under_500", label: "Under 500 BD" },
  { value: "under_1000", label: "Under 1000 BD" },
  { value: "custom", label: "Custom" },
] as const;

const CHALLENGES = [
  { value: "overspending", label: "Overspending" },
  { value: "not_saving", label: "Not saving enough" },
  { value: "no_visibility", label: "No visibility" },
] as const;

type Goal = (typeof GOALS)[number]["value"];
type Income = (typeof INCOMES)[number]["value"];
type Challenge = (typeof CHALLENGES)[number]["value"];

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
      {selected ? <Check size={18} color={colors.accent} strokeWidth={3} /> : null}
    </TouchableOpacity>
  );
}

export default function Onboarding() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [income, setIncome] = useState<Income | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const [customIncome, setCustomIncome] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const incomeAnswered =
    income !== null && (income !== "custom" || customIncome.trim().length > 0);

  const canSubmit =
    goal !== null && incomeAnswered && challenge !== null && !submitting;

  const handleConfirm = async () => {
    if (!canSubmit || goal === null || challenge === null) return;

    setMessage("");
    setSubmitting(true);

    try {
      const incomeRange = income === "custom" ? customIncome.trim() : income!;

      await submitOnboarding(goal, incomeRange, challenge);

      router.replace("/home");
    } catch (error: any) {
      setMessage(error.message);
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>Let's set things up</Text>
        <Text style={styles.subtitle}>
          Three quick questions so FinanceOS fits how you spend.
        </Text>

        <View style={styles.card}>
          <Text style={styles.question}>What's your main goal?</Text>
          {GOALS.map((item) => (
            <Option
              key={item.value}
              label={item.label}
              selected={goal === item.value}
              onPress={() => setGoal(item.value)}
            />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.question}>What's your monthly income?</Text>
          {INCOMES.map((item) => (
            <Option
              key={item.value}
              label={item.label}
              selected={income === item.value}
              onPress={() => setIncome(item.value)}
            />
          ))}

          {income === "custom" ? (
            <TextInput
              style={styles.input}
              placeholder="Enter your monthly income"
              placeholderTextColor={colors.muted}
              value={customIncome}
              onChangeText={setCustomIncome}
              keyboardType="numeric"
            />
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.question}>What's your biggest challenge?</Text>
          {CHALLENGES.map((item) => (
            <Option
              key={item.value}
              label={item.label}
              selected={challenge === item.value}
              onPress={() => setChallenge(item.value)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={!canSubmit}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Saving..." : "Confirm"}
          </Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: spacing.s4,
    paddingTop: spacing.s8,
    paddingBottom: spacing.s8,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.s4,
    marginBottom: spacing.s4,
    ...shadow.card,
  },
  question: {
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.s3,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.neutral100,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "transparent",
    padding: spacing.s3,
    marginBottom: spacing.s2,
  },
  optionSelected: {
    backgroundColor: colors.accent100,
    borderColor: colors.accent,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  optionTextSelected: {
    fontFamily: fonts.bodySemibold,
    color: colors.accent800,
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.neutral100,
    borderRadius: radius.md,
    padding: spacing.s3,
    marginTop: spacing.s1,
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
  message: {
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: spacing.s4,
    color: colors.text,
  },
});
