import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Header,
  BookCover,
  Badge,
  EmptyState,
  Loading,
  C,
} from '../../components/ui';
import { searchBooks, Book } from '../../lib/books';
import { loadState, saveBookMetadata } from '../../lib/store';

const POPULAR_TOPICS = [
  'Bestsellers',
  'Classic Novels',
  'Philosophy',
  'Nature & Plants',
  'Poetry',
  'Science Fiction',
  'Psychology',
  'Art & Design',
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [err, setErr] = useState('');

  async function executeSearch(target = query) {
    const q = target.trim();
    if (!q) return;
    Keyboard.dismiss();
    setLoading(true);
    setErr('');
    setHasSearched(true);
    try {
      const results = await searchBooks(q);
      setBooks(results);
    } catch {
      setErr('Search request failed. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectTopic(topic: string) {
    setQuery(topic);
    executeSearch(topic);
  }

  function handleClear() {
    setQuery('');
    setBooks([]);
    setHasSearched(false);
    setErr('');
  }

  async function handleBookPress(b: Book) {
    const state = await loadState();
    const updated = saveBookMetadata(state, {
      id: b.id,
      title: b.title,
      author: b.author,
      cover: b.cover,
      year: b.year,
    });
    // Persist metadata in background
    require('../../lib/store').saveState(updated);

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
  }

  return (
    <Screen>
      <Header
        title="Find a Story"
        subtitle="Search Open Library archives by title, author, or theme"
      />

      {/* Search Input Bar */}
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={18} color={C.muted} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => executeSearch()}
          placeholder="Title, author, or subject..."
          placeholderTextColor={C.muted}
          returnKeyType="search"
          style={styles.textInput}
        />
        {query.length > 0 ? (
          <Pressable onPress={handleClear} hitSlop={10} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => executeSearch()}
          style={({ pressed }) => [
            styles.searchActionBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.searchActionBtnText}>Search</Text>
        </Pressable>
      </View>

      {/* Topic Chips */}
      <View style={styles.topicsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsScroll}
        >
          {POPULAR_TOPICS.map((topic) => (
            <Pressable
              key={topic}
              onPress={() => handleSelectTopic(topic)}
              style={({ pressed }) => [
                styles.topicChip,
                query === topic && styles.topicChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.topicChipText,
                  query === topic && styles.topicChipTextActive,
                ]}
              >
                {topic}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content Area */}
      {loading ? (
        <Loading message="Browsing titles..." />
      ) : err ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={24} color={C.danger} />
          <Text style={styles.errorText}>{err}</Text>
          <Pressable
            onPress={() => executeSearch()}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : books.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContainer}
        >
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {books.length} titles found
            </Text>
            <Badge label="Open Library" variant="surface" />
          </View>

          <View style={styles.booksGrid}>
            {books.map((b, i) => (
              <Pressable
                key={b.id || i}
                onPress={() => handleBookPress(b)}
                style={({ pressed }) => [
                  styles.gridItem,
                  pressed && styles.pressed,
                ]}
              >
                <BookCover book={b} index={i} size="md" />
                <Text numberOfLines={2} style={styles.bookTitle}>
                  {b.title}
                </Text>
                <Text numberOfLines={1} style={styles.bookAuthor}>
                  {b.author}
                </Text>
                {b.year ? (
                  <View style={{ marginTop: 4 }}>
                    <Badge label={String(b.year)} variant="surface" />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : hasSearched ? (
        <EmptyState
          icon="search-outline"
          title="No books matched your query"
          description="Try checking for typos or searching by author name or genre."
          actionLabel="Clear search"
          onAction={handleClear}
        />
      ) : (
        <EmptyState
          icon="compass-outline"
          title="Begin your search"
          description="Explore classic literature, contemporary fiction, or philosophy from Open Library."
          actionLabel="Explore Classics"
          onAction={() => handleSelectTopic('Classic Novels')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    height: 50,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: C.cream,
    fontSize: 14,
    paddingVertical: 10,
  },
  clearBtn: {
    padding: 6,
    marginRight: 4,
  },
  searchActionBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchActionBtnText: {
    color: C.primaryText,
    fontSize: 13,
    fontWeight: '800',
  },
  topicsRow: {
    marginBottom: 16,
  },
  topicsScroll: {
    gap: 8,
  },
  topicChip: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  topicChipActive: {
    backgroundColor: C.primaryDark,
    borderColor: 'rgba(157, 228, 136, 0.4)',
  },
  topicChipText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  topicChipTextActive: {
    color: C.primary,
    fontWeight: '700',
  },
  resultsContainer: {
    paddingBottom: 40,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultsCount: {
    color: C.cream,
    fontSize: 14,
    fontWeight: '700',
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  gridItem: {
    width: '47%',
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
  errorBox: {
    padding: 24,
    backgroundColor: C.dangerDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(242, 139, 130, 0.3)',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    color: C.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  retryBtnText: {
    color: C.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
