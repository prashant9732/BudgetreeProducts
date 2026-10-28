
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  images?: string[];
};

const FAVORITES_KEY = '@budgetree_favorites';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `https://dummyjson.com/products/${id}`
        );

        if (!response.ok) {
          throw new Error('Unable to load product');
        }

        const data: Product = await response.json();

        if (active) {
          setProduct(data);
        }
      } catch {
        if (active) {
          setError(
            'Product load nahi hua. Internet check karke dobara try karo.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadProduct();
    } else {
      setError('Product ID nahi mili.');
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [id]);

  const loadFavoriteStatus = useCallback(async () => {
    if (!product) return;

    try {
      const saved = await AsyncStorage.getItem(FAVORITES_KEY);
      const favorites: Product[] = saved ? JSON.parse(saved) : [];

      setIsFavorite(
        favorites.some((item) => item.id === product.id)
      );
    } catch {
      setIsFavorite(false);
    }
  }, [product]);

  useFocusEffect(
    useCallback(() => {
      loadFavoriteStatus();
    }, [loadFavoriteStatus])
  );

  async function toggleFavorite() {
    if (!product || favoriteLoading) return;

    setFavoriteLoading(true);

    try {
      const saved = await AsyncStorage.getItem(FAVORITES_KEY);
      const favorites: Product[] = saved ? JSON.parse(saved) : [];

      const alreadyFavorite = favorites.some(
        (item) => item.id === product.id
      );

      const updated = alreadyFavorite
        ? favorites.filter((item) => item.id !== product.id)
        : [...favorites, product];

      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updated)
      );

      setIsFavorite(!alreadyFavorite);
    } catch {
      setError('Favorite save nahi hua. Dobara try karo.');
    } finally {
      setFavoriteLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.message}>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || 'Product nahi mila.'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Product Details' }} />

      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.category}>
          {product.category.replace(/-/g, ' ')}
        </Text>

        <Text style={styles.title}>{product.title}</Text>

        <Text style={styles.price}>
          ${product.price.toFixed(2)}
        </Text>

        <Pressable
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteActive,
          ]}
          onPress={toggleFavorite}
          disabled={favoriteLoading}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          <Text style={styles.favoriteButtonText}>
            {favoriteLoading
              ? 'Saving...'
              : isFavorite
                ? '❤️ Remove from Favorites'
                : '♡ Add to Favorites'}
          </Text>
        </Pressable>

        <Text style={styles.heading}>Description</Text>
        <Text style={styles.description}>
          {product.description}
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  category: {
    color: '#2563EB',
    fontSize: 14,
    textTransform: 'capitalize',
    marginTop: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 12,
  },
  favoriteButton: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  favoriteActive: {
    backgroundColor: '#DC2626',
  },
  favoriteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  message: {
    marginTop: 12,
    color: '#4B5563',
  },
  error: {
    color: '#DC2626',
    textAlign: 'center',
  },
});
