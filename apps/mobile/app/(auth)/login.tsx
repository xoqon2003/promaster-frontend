import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Phone OTP login — mock flow for now.
 * Real OTP via @ustatop/api-client (S14 — mobile auth integration).
 */
export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    // Mock — real OTP will route to /(auth)/otp
    router.replace('/(tabs)');
  };

  const isValid = /^\+?998\d{9}$/.test(phone.replace(/\s/g, ''));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-4">
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Orqaga"
          className="size-10 rounded-full items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#0a0a0a" />
        </Pressable>

        {/* Heading */}
        <View className="mt-8 gap-2">
          <Text className="font-display text-3xl font-bold text-neutral-900">
            Telefon raqamingiz
          </Text>
          <Text className="text-base text-neutral-500">
            SMS-kod yuboramiz. Reklama uchun ishlatilmaydi.
          </Text>
        </View>

        {/* Input */}
        <View className="mt-8">
          <Text className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
            Telefon
          </Text>
          <View className="flex-row items-center mt-2 border-2 border-neutral-200 rounded-2xl px-4 py-3 focus-within:border-brand-500">
            <Text className="text-base text-neutral-700 font-medium">+998</Text>
            <View className="w-px h-6 bg-neutral-200 mx-3" />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="90 123 45 67"
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={15}
              className="flex-1 text-base text-neutral-900"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Text className="text-xs text-neutral-400 mt-2">
            Eskiz.uz orqali xavfsiz SMS yuborish
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!isValid}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValid }}
          className={`mt-8 rounded-2xl py-4 items-center ${
            isValid ? 'bg-brand-500 active:opacity-90' : 'bg-neutral-200'
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              isValid ? 'text-white' : 'text-neutral-500'
            }`}
          >
            SMS yuborish
          </Text>
        </Pressable>

        {/* Legal */}
        <Text className="text-xs text-neutral-400 text-center mt-6 leading-relaxed">
          Davom etib, siz{' '}
          <Text className="text-brand-500 underline">Foydalanish shartlari</Text> va{' '}
          <Text className="text-brand-500 underline">Maxfiylik siyosati</Text>ga rozi
          bo&apos;lasiz.
        </Text>
      </View>
    </SafeAreaView>
  );
}
