import { useRouter } from 'expo-router';
import { ChevronRight, Globe, HelpCircle, LogOut, Settings, Shield } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU = [
  { icon: Settings, label: "Sozlamalar", href: '/settings' },
  { icon: Shield, label: 'Xavfsizlik', href: '/security' },
  { icon: Globe, label: 'Til · O\'zbekcha', href: '/locale' },
  { icon: HelpCircle, label: 'Yordam', href: '/help' },
];

export default function ProfileTab() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView>
        <View className="px-5 pt-3 pb-6">
          <Text className="font-display text-2xl font-bold text-neutral-900">Profil</Text>
        </View>

        {/* User card */}
        <View className="mx-5 bg-white rounded-3xl p-5 flex-row items-center gap-4 border border-neutral-200">
          <View className="size-16 bg-brand-100 rounded-full items-center justify-center">
            <Text className="text-brand-600 font-display text-2xl font-bold">X</Text>
          </View>
          <View className="flex-1">
            <Text className="font-display text-lg font-semibold text-neutral-900">
              Xoqon
            </Text>
            <Text className="text-sm text-neutral-500">+998 90 123 45 67</Text>
            <View className="flex-row items-center gap-1 mt-1">
              <View className="bg-success/10 rounded-full px-2 py-0.5">
                <Text className="text-success text-[10px] font-semibold">✓ Tasdiqlangan</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View className="mx-5 mt-5 bg-white rounded-3xl border border-neutral-200 overflow-hidden">
          {MENU.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === MENU.length - 1;
            return (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                className={`flex-row items-center gap-3 px-5 py-4 ${
                  !isLast ? 'border-b border-neutral-100' : ''
                } active:bg-neutral-50`}
              >
                <View className="size-9 rounded-xl bg-neutral-100 items-center justify-center">
                  <Icon size={18} color="#475569" />
                </View>
                <Text className="flex-1 text-base text-neutral-800 font-medium">
                  {item.label}
                </Text>
                <ChevronRight size={18} color="#94a3b8" />
              </Pressable>
            );
          })}
        </View>

        {/* Logout */}
        <Pressable
          onPress={() => router.replace('/')}
          accessibilityRole="button"
          className="mx-5 mt-5 bg-white rounded-3xl border border-neutral-200 px-5 py-4 flex-row items-center gap-3 active:bg-neutral-50"
        >
          <View className="size-9 rounded-xl bg-danger/10 items-center justify-center">
            <LogOut size={18} color="#dc2626" />
          </View>
          <Text className="flex-1 text-base text-danger font-medium">Chiqish</Text>
        </Pressable>

        {/* Footer */}
        <Text className="text-center text-xs text-neutral-400 mt-8 mb-4">
          UstaTop v0.1.0 · 🇺🇿 O&apos;zbekistonda yaratildi
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
