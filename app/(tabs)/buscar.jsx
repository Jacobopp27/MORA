import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useState } from 'react'
import {
  Search,
  X,
  Clock,
  Dumbbell,
  Apple,
  Brain,
  Sparkles,
  Car,
  Heart,
} from 'lucide-react-native'
import { Colors } from '../../constants/Colors'

const RECENT_SEARCHES = [
  'Entrenadora personal',
  'Nutricionista Bogotá',
  'Masajes relajantes',
  'Psicóloga online',
]

const CATEGORIES = [
  {
    id: 'fitness',
    label: 'Fitness',
    icon: Dumbbell,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    id: 'nutricion',
    label: 'Nutrición',
    icon: Apple,
    color: '#f472b6',
    bg: '#fdf2f8',
  },
  {
    id: 'psicologia',
    label: 'Psicología',
    icon: Brain,
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    id: 'estetica',
    label: 'Estética',
    icon: Sparkles,
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    id: 'transporte',
    label: 'Transporte',
    icon: Car,
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    id: 'cuidado',
    label: 'Cuidado',
    icon: Heart,
    color: '#ec4899',
    bg: '#fdf2f8',
  },
]

export default function BuscarScreen() {
  const [query, setQuery] = useState('')
  const [recents, setRecents] = useState(RECENT_SEARCHES)

  function removeRecent(item) {
    setRecents((prev) => prev.filter((r) => r !== item))
  }

  function handleSearch(term) {
    const searchTerm = term || query
    if (!searchTerm.trim()) return
    router.push({ pathname: '/(tabs)/explorar', params: { search: searchTerm.trim() } })
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busca servicios, especialidades…"
            placeholderTextColor={Colors.textLight}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recent searches */}
        {recents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
              <TouchableOpacity onPress={() => setRecents([])} activeOpacity={0.7}>
                <Text style={styles.clearAll}>Borrar todo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentChips}>
              {recents.map((item) => (
                <View key={item} style={styles.recentChip}>
                  <Clock size={13} color={Colors.textMuted} />
                  <TouchableOpacity
                    onPress={() => handleSearch(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.recentChipText}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeRecent(item)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <X size={13} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Popular categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías populares</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, { backgroundColor: cat.bg }]}
                  activeOpacity={0.85}
                  onPress={() => handleSearch(cat.label)}
                >
                  <View
                    style={[styles.categoryIconCircle, { backgroundColor: cat.color + '22' }]}
                  >
                    <Icon size={24} color={cat.color} />
                  </View>
                  <Text style={[styles.categoryLabel, { color: cat.color }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Popular services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios populares</Text>
          <View style={styles.popularList}>
            {[
              'Entrenadora personal a domicilio',
              'Consulta nutricional online',
              'Psicóloga cognitivo-conductual',
              'Masajes terapéuticos',
              'Niñera certificada',
              'Conductora nocturna segura',
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.popularItem}
                activeOpacity={0.7}
                onPress={() => handleSearch(item)}
              >
                <Search size={15} color={Colors.textMuted} />
                <Text style={styles.popularItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: Colors.borderMed,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textMain,
    padding: 0,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 12,
  },
  clearAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentChipText: {
    fontSize: 13,
    color: Colors.textMain,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  popularList: {
    gap: 0,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  popularItemText: {
    fontSize: 14,
    color: Colors.textMain,
    flex: 1,
  },
})
