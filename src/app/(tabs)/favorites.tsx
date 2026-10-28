
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  thumbnail: string;
};

const FAVORITES_KEY = '@budgetree_favorites';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(FAVORITES_KEY);
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  async function removeFavorite(id: number) {
    const updated = favorites.filter((item) => item.id !== id);
    setFavorites(updated);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Favorites ❤️</Text>

      {favorites.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Add products to your favorites from the product screen.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.product}
                onPress={() =>
                  router.push({
                    pathname: '/product/[id]',
                    params: { id: String(item.id) },
                  })
                }
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.image}
                  resizeMode="contain"
                />
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.price}>
                    ${item.price.toFixed(2)}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.removeButton}
                onPress={() => removeFavorite(item.id)}
              >
                <Text style={styles.removeText}>Remove ❤️</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  category: {
    color: '#64748B',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 7,
  },
  removeButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  removeText: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 8,
  },
});
