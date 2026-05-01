import { Calendar } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersTab() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-3 flex-1">
        <Text className="font-display text-2xl font-bold text-neutral-900">Buyurtmalar</Text>

        <View className="flex-1 items-center justify-center px-6">
          <View className="size-20 bg-brand-50 rounded-full items-center justify-center mb-4">
            <Calendar size={36} color="#2463eb" />
          </View>
          <Text className="font-display text-lg font-semibold text-neutral-900 text-center">
            Hali buyurtmangiz yo&apos;q
          </Text>
          <Text className="text-sm text-neutral-500 mt-2 text-center">
            Birinchi buyurtmangizni joylashtiring va 20% chegirma oling
          </Text>
          <Pressable
            accessibilityRole="button"
            className="bg-brand-500 rounded-2xl py-3 px-6 mt-6 active:opacity-90"
          >
            <Text className="text-white font-semibold text-sm">Buyurtma berish</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
