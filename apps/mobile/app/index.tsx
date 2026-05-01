import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Onboarding / hero screen — birinchi launch'da ko'rinadi.
 *
 * Brand-tone gradient bg, value prop, dual CTA. Web landing'ning
 * mobile-native ekvivalenti.
 */
export default function OnboardingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-500">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-between px-6 py-10">
          {/* Brand */}
          <View className="flex-row items-center gap-2">
            <View className="bg-white rounded-xl h-10 w-10 items-center justify-center">
              <Text className="text-brand-500 font-display text-2xl font-bold">U</Text>
            </View>
            <Text className="text-white font-display text-xl font-bold">
              UstaTop<Text className="opacity-70">.uz</Text>
            </Text>
          </View>

          {/* Hero */}
          <View className="items-center gap-4 mt-12">
            <View className="bg-white/15 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-medium">
                🇺🇿 O&apos;zbekiston #1 ustalar
              </Text>
            </View>

            <Text className="text-white font-display text-4xl font-bold text-center leading-tight">
              Professional ustani{'\n'}
              <Text className="text-amber-300">30 soniyada</Text>{'\n'}
              toping
            </Text>

            <Text className="text-white/85 text-base text-center max-w-xs">
              1000+ tekshirilgan usta · Escrow himoyasi · Real-time tracking
            </Text>
          </View>

          {/* Trust chips */}
          <View className="flex-row flex-wrap gap-2 justify-center mt-8">
            {['🛡️ Escrow', '✅ MyID', '🏅 30 kun kafolat'].map((chip) => (
              <View key={chip} className="bg-white/15 rounded-full px-3 py-1.5">
                <Text className="text-white text-xs font-medium">{chip}</Text>
              </View>
            ))}
          </View>

          {/* CTAs */}
          <View className="w-full gap-3 mt-12">
            <Link href="/(auth)/login" asChild>
              <Pressable
                accessibilityRole="button"
                className="bg-white rounded-2xl py-4 items-center active:opacity-80"
              >
                <Text className="text-brand-700 text-base font-semibold">
                  Mijoz sifatida boshlash
                </Text>
              </Pressable>
            </Link>

            <Link href="/(auth)/login?role=pro" asChild>
              <Pressable
                accessibilityRole="button"
                className="border-2 border-white/30 rounded-2xl py-4 items-center active:opacity-70"
              >
                <Text className="text-white text-base font-semibold">
                  Usta bo&apos;lib ro&apos;yxatdan o&apos;tish
                </Text>
              </Pressable>
            </Link>

            <Link href="/(tabs)" asChild>
              <Pressable className="py-2 items-center">
                <Text className="text-white/70 text-sm">
                  Ko&apos;rib chiqish (kirgansiz?)
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
