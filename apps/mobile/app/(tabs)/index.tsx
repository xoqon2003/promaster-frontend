import { Bell, Search } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  { id: 'repair', icon: '🔨', name: 'Ta\'mirlash' },
  { id: 'plumbing', icon: '💧', name: 'Santexnika' },
  { id: 'electric', icon: '⚡', name: 'Elektrik' },
  { id: 'cleaning', icon: '✨', name: 'Tozalash' },
  { id: 'beauty', icon: '✂️', name: 'Go\'zallik' },
  { id: 'tutoring', icon: '🎓', name: 'Repetitor' },
  { id: 'it', icon: '💻', name: 'IT' },
  { id: 'auto', icon: '🚗', name: 'Avto' },
];

const TOP_MASTERS = [
  {
    id: 'm1',
    name: 'Anvar Karimov',
    cat: 'Santexnika',
    rating: 4.9,
    reviews: 234,
    badge: 'Premium',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    id: 'm2',
    name: 'Dilafruz Yusupova',
    cat: 'Go\'zallik',
    rating: 5.0,
    reviews: 187,
    badge: 'Pro',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'm3',
    name: 'Sherzod Toshmatov',
    cat: 'Elektrik',
    rating: 4.8,
    reviews: 156,
    badge: 'Premium',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
];

export default function HomeTab() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Salom 👋</Text>
            <Text className="font-display text-xl font-bold text-neutral-900">
              Qanday usta kerak?
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Bildirishnomalar"
            className="size-10 rounded-full bg-white border border-neutral-200 items-center justify-center"
          >
            <Bell size={18} color="#0a0a0a" />
          </Pressable>
        </View>

        {/* Search */}
        <View className="px-5 mb-5">
          <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center gap-3 border border-neutral-200">
            <Search size={20} color="#94a3b8" />
            <Text className="text-base text-neutral-400">
              Santexnik, elektrik, fotograf...
            </Text>
          </View>
        </View>

        {/* Hero card */}
        <View className="mx-5 mb-6 bg-brand-500 rounded-3xl p-5 overflow-hidden">
          <Text className="text-white/80 text-xs font-medium uppercase tracking-wider">
            Bugungi taklif
          </Text>
          <Text className="text-white font-display text-2xl font-bold mt-2 leading-tight">
            Birinchi buyurtmaga{'\n'}
            <Text className="text-amber-300">20% chegirma</Text>
          </Text>
          <Pressable className="mt-4 bg-white rounded-full py-2.5 px-5 self-start active:opacity-90">
            <Text className="text-brand-700 font-semibold text-sm">Foydalanish</Text>
          </Pressable>
        </View>

        {/* Categories */}
        <View className="px-5 mb-2 flex-row items-center justify-between">
          <Text className="font-display text-lg font-bold text-neutral-900">
            Kategoriyalar
          </Text>
          <Pressable>
            <Text className="text-brand-500 text-sm font-medium">Hammasi</Text>
          </Pressable>
        </View>

        <View className="px-5 mb-7 flex-row flex-wrap -mx-1">
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              accessibilityRole="button"
              accessibilityLabel={cat.name}
              className="w-1/4 px-1 mb-3"
            >
              <View className="bg-white rounded-2xl py-4 px-2 items-center border border-neutral-200 active:opacity-70">
                <Text className="text-2xl">{cat.icon}</Text>
                <Text className="text-xs font-medium text-neutral-700 mt-2 text-center">
                  {cat.name}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Top masters */}
        <View className="px-5 mb-2 flex-row items-center justify-between">
          <Text className="font-display text-lg font-bold text-neutral-900">
            Eng yaxshi ustalar
          </Text>
          <Pressable>
            <Text className="text-brand-500 text-sm font-medium">Hammasi</Text>
          </Pressable>
        </View>

        <View className="px-5 gap-3 mb-8">
          {TOP_MASTERS.map((m) => (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={`${m.name} — ${m.cat}, reyting ${m.rating}`}
              className="bg-white rounded-2xl p-4 flex-row items-center gap-3 border border-neutral-200 active:opacity-80"
            >
              {/* Avatar placeholder */}
              <View className="size-14 bg-brand-100 rounded-full items-center justify-center">
                <Text className="text-brand-600 font-display text-lg font-bold">
                  {m.name.charAt(0)}
                </Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold text-base text-neutral-900">
                    {m.name}
                  </Text>
                  <View className="bg-success/10 rounded-full size-4 items-center justify-center">
                    <Text className="text-success text-[10px]">✓</Text>
                  </View>
                </View>
                <Text className="text-sm text-neutral-500 mt-0.5">{m.cat}</Text>
                <Text className="text-xs text-neutral-400 mt-1">
                  ⭐ {m.rating.toFixed(1)} · {m.reviews} sharh
                </Text>
              </View>

              <View className={`rounded-full px-2.5 py-1 ${m.badgeColor.split(' ')[0]}`}>
                <Text className={`text-[10px] font-semibold ${m.badgeColor.split(' ')[1]}`}>
                  {m.badge}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
