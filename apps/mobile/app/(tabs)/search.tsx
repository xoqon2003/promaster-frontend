import { Search } from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchTab() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-3">
        <Text className="font-display text-2xl font-bold text-neutral-900">Qidiruv</Text>
        <View className="bg-neutral-100 rounded-2xl px-4 py-3 flex-row items-center gap-3 mt-4">
          <Search size={20} color="#94a3b8" />
          <TextInput
            placeholder="Qaysi xizmat kerak?"
            placeholderTextColor="#9ca3af"
            className="flex-1 text-base text-neutral-900"
          />
        </View>
        <View className="mt-12 items-center">
          <Text className="text-6xl mb-3">🔍</Text>
          <Text className="font-display text-lg font-semibold text-neutral-900">
            Qidiruvni boshlang
          </Text>
          <Text className="text-sm text-neutral-500 mt-1 text-center max-w-xs">
            Ustaning kasbi, mahallasi yoki ismi bo&apos;yicha qidiring
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
