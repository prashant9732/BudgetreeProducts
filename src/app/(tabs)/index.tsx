import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  thumbnail: string;
};

type ProductResponse = {
  products: Product[];
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);

  async function fetchProducts() {
    try {
      setError('');

      const response = await fetch('https://dummyjson.com/products');

      if (!response.ok) {
        throw new Error('Unable to load products. Please try again.');
      }

      const data: ProductResponse = await response.json();
      setProducts(data.products);
    } catch {
      setError('Products load nahi ho paaye. Internet check karke retry karein.');
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('https://dummyjson.com/products/categories');

      if (!response.ok) {
        throw new Error('Categories could not be loaded');
      }

      const data: { slug: string; name: string }[] = await response.json();
      setCategories(data.map((item) => item.slug));
    } catch {
      setCategories([]);
    }
  }

  useEffect(() => {
    async function loadData() {
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    }

    loadData();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchProducts();
    await fetchCategories();
    setRefreshing(false);
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.message}>Loading products...</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Budgetree</Text>
      <Text style={styles.subtitle}>Discover products you'll love</Text>

      <TextInput
        style={styles.search}
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Search products by title"
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['All', ...categories]}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.categoryChip,
              selectedCategory === item && styles.activeChip,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.activeChipText,
              ]}
            >
              {item === 'All'
                ? 'All'
                : item.replace(/-/g, ' ')}
            </Text>
          </Pressable>
        )}
      />

      <Text style={styles.resultCount}>
        {filteredProducts.length} products
      </Text>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <Text style={styles.message}>No products found.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/product/[id]',
                params: { id: String(item.id) },
             })
            }
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.productImage}
              resizeMode="contain"
            />
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.productCategory}>
              {item.category.replace(/-/g, ' ')}
            </Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
           </Pressable>
        )}
      />
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
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  search: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 13,
    fontSize: 16,
  },
  categoryList: {
    paddingVertical: 14,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  activeChip: {
    backgroundColor: '#2563EB',
  },
  categoryText: {
    color: '#334155',
    textTransform: 'capitalize',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultCount: {
    color: '#64748B',
    marginBottom: 10,
  },
  productList: {
    paddingBottom: 24,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productImage: {
    width: '100%',
    height: 130,
    marginBottom: 10,
  },
  productTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    minHeight: 38,
  },
  productCategory: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  price: {
    color: '#2563EB',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  message: {
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
  error: {
    color: '#DC2626',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
