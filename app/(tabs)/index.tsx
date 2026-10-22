import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  BookCover,
  ProgressBar,
  Badge,
  Loading,
  C,
} from '../../components/ui';
import {
  searchBooks,
  Book,
  CURATED_CATEGORIES,
  FALLBACK_BOOKS,
} from '../../lib/books';
import { loadState, State, saveBookMetadata } from '../../lib/store';

export default function Discover() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [activeCategory, setActiveCategory] = useState(CURATED_CATEGORIES[0].key);
  const [userState, setUserState] = useState<State | null>(null);

  const fetchCategoryBooks = useCallback(async (query: string) => {
    setLoading(true);
    setErr('');
    try {
      const results = await searchBooks(query);
      setBooks(results);
    } catch {
      setBooks(FALLBACK_BOOKS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoryBooks(CURATED_CATEGORIES[0].query);
  }, [fetchCategoryBooks]);

  useFocusEffect(
    useCallback(() => {
      loadState().then(setUserState);
    }, [])
  );

  const handleCategoryPress = (cat: typeof CURATED_CATEGORIES[number]) => {
    setActiveCategory(cat.key);
    fetchCategoryBooks(cat.query);
  };

  const handleBookPress = async (b: Book) => {
    if (userState) {
      const updated = saveBookMetadata(userState, {
        id: b.id,
        title: b.title,
        author: b.author,
        cover: b.cover,
        year: b.year,
      });
      setUserState(updated);
    }
    router.push({
      pathname: '/book/[id]',
      params: {
        id: encodeURIComponent(b.id),
        title: b.title,
        author: b.author,
        cover: b.cover,
        year: String(b.year || ''),
      },
    });
  };

  // Check if there is an active book in progress
  const currentBookTitle = userState?.reading?.[0];
  const currentProgress = currentBookTitle
    ? userState?.progress?.[currentBookTitle] || 0
    : 0;
  const currentBookMeta = currentBookTitle
    ? userState?.bookDetails?.[currentBookTitle]
    : null;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              const cat = CURATED_CATEGORIES.find((c) => c.key === activeCategory);
              fetchCategoryBooks(cat?.query || 'bestsellers');
            }}
            tintColor={C.primary}
          />
        }
      >
        {/* Top Brand & Greeting Header */}
        <View style={styles.topHeader}>
          <View style={styles.brandBadge}>
            <Ionicons name="leaf" size={14} color={C.primary} />
            <Text style={styles.brandTitle}>BookGarden</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/search')}
            style={({ pressed }) => [styles.searchCircleBtn, pressed && styles.pressed]}
            accessibilityLabel="Search"
          >
            <Ionicons name="search" size={18} color={C.cream} />
          </Pressable>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.eyebrow}>YOUR PERSONAL READING NOOK</Text>
          <Text style={styles.mainHeading}>Grow your next{'\n'}great read.</Text>
          <Text style={styles.subHeading}>
            Quiet stories and timeless ideas worth slowing down for.
          </Text>
        </View>

        {/* Quick Search Bar Navigation Banner */}
        <Pressable
          onPress={() => router.push('/(tabs)/search')}
          style={({ pressed }) => [styles.searchBarBanner, pressed && styles.pressed]}
        >
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <Text style={styles.searchBarPlaceholder}>
            Search titles, authors, or genres...
          </Text>
        </Pressable>

        {/* Currently Cultivating Card if user is reading */}
        {currentBookTitle ? (
          <Pressable
            onPress={() => router.push('/(tabs)/reading')}
            style={({ pressed }) => [styles.activeReadingCard, pressed && styles.pressed]}
          >
            <View style={styles.activeReadingTop}>
              <View style={styles.activeReadingBadge}>
                <Ionicons name="sparkles" size={11} color={C.amber} />
                <Text style={styles.activeReadingBadgeText}>CURRENTLY CULTIVATING</Text>
              </View>
              <Text style={styles.activeReadingPercent}>{currentProgress}%</Text>
            </View>
            <View style={styles.activeReadingBody}>
              <BookCover
                book={{
                  title: currentBookTitle,
                  author: currentBookMeta?.author,
                  cover: currentBookMeta?.cover,
                }}
                size="sm"
              />
              <View style={styles.activeReadingInfo}>
                <Text style={styles.activeReadingTitle} numberOfLines={2}>
                  {currentBookTitle}
                </Text>
                {currentBookMeta?.author ? (
                  <Text style={styles.activeReadingAuthor} numberOfLines={1}>
                    {currentBookMeta.author}
                  </Text>
                ) : null}
                <View style={{ marginTop: 8 }}>
                  <ProgressBar progress={currentProgress} height={6} />
                </View>
              </View>
            </View>
          </Pressable>
        ) : (
          <View style={styles.inspirationBanner}>
            <View style={styles.inspirationIconWrap}>
              <Ionicons name="book-outline" size={20} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inspirationTitle}>A Garden of Stories</Text>
              <Text style={styles.inspirationSubtitle}>
                Read a single chapter today. Steady habits compound into grand shelves.
              </Text>
            </View>
          </View>
        )}

        {/* Categories Carousel */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Curated Shelves</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CURATED_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                onPress={() => handleCategoryPress(cat)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Books Content */}
        {loading ? (
          <Loading message="Browsing Open Library shelves..." />
        ) : err ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={24} color={C.danger} />
            <Text style={styles.errorText}>{err}</Text>
          </View>
        ) : (
          <>
            {/* Featured Horizontal Scroller */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Featured Works</Text>
              <Badge label={`${books.length} titles`} variant="surface" />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.booksHorizontalScroll}
            >
              {books.map((b, i) => (
                <Pressable
                  key={b.id || i}
                  onPress={() => handleBookPress(b)}
                  style={({ pressed }) => [styles.bookColCard, pressed && styles.pressed]}
                >
                  <BookCover book={b} index={i} size="md" />
                  <Text numberOfLines={2} style={styles.bookTitle}>
                    {b.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.bookAuthor}>
                    {b.author}
                  </Text>
                  {b.year ? (
                    <Text style={styles.bookYear}>{b.year}</Text>
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>

            {/* Recommended List Grid */}
            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
              <Text style={styles.sectionHeading}>Recommended For You</Text>
            </View>

            <View style={styles.listColumn}>
              {books.slice(0, 4).map((b, i) => (
                <Pressable
                  key={`list-${b.id || i}`}
                  onPress={() => handleBookPress(b)}
                  style={({ pressed }) => [styles.bookRowCard, pressed && styles.pressed]}
                >
                  <BookCover book={b} index={i + 2} size="sm" />
                  <View style={styles.bookRowInfo}>
                    <Text numberOfLines={2} style={styles.bookRowTitle}>
                      {b.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.bookRowAuthor}>
                      {b.author}
                    </Text>
                    <View style={styles.bookRowMeta}>
                      {b.year ? (
                        <Badge label={String(b.year)} variant="surface" />
                      ) : null}
                      <Text style={styles.exploreHint}>Explore details</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.subtle} />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 36,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderColor: C.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  brandTitle: {
    color: C.cream,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  searchCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 20,
  },
  eyebrow: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  mainHeading: {
    color: C.cream,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  subHeading: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  searchBarBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 20,
    gap: 10,
  },
  searchBarPlaceholder: {
    color: C.muted,
    fontSize: 13,
  },
  activeReadingCard: {
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 18,
    padding: 14,
    marginBottom: 24,
  },
  activeReadingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeReadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activeReadingBadgeText: {
    color: C.amber,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  activeReadingPercent: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  activeReadingBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  activeReadingInfo: {
    flex: 1,
  },
  activeReadingTitle: {
    color: C.cream,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  activeReadingAuthor: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  inspirationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    gap: 12,
  },
  inspirationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157, 228, 136, 0.2)',
  },
  inspirationTitle: {
    color: C.cream,
    fontSize: 14,
    fontWeight: '700',
  },
  inspirationSubtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    color: C.cream,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  categoriesRow: {
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  categoryChipText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: C.primaryText,
    fontWeight: '800',
  },
  booksHorizontalScroll: {
    gap: 14,
    paddingRight: 10,
  },
  bookColCard: {
    width: 114,
  },
  bookTitle: {
    color: C.cream,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 8,
  },
  bookAuthor: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },
  bookYear: {
    color: C.subtle,
    fontSize: 10,
    marginTop: 2,
  },
  listColumn: {
    gap: 10,
  },
  bookRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 10,
    gap: 12,
  },
  bookRowInfo: {
    flex: 1,
  },
  bookRowTitle: {
    color: C.cream,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  bookRowAuthor: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  bookRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  exploreHint: {
    color: C.subtle,
    fontSize: 11,
  },
  errorBox: {
    padding: 20,
    backgroundColor: C.dangerDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(242, 139, 130, 0.3)',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: C.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
