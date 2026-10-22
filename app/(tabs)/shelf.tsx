import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Header,
  BookCover,
  Badge,
  Button,
  EmptyState,
  StatCard,
  C,
} from '../../components/ui';
import { loadState, saveState, State } from '../../lib/store';

type FilterTab = 'all' | 'saved' | 'reading' | 'finished';

export default function Shelf() {
  const [userState, setUserState] = useState<State | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');

  const refresh = useCallback(() => {
    loadState().then(setUserState);
  }, []);

  useFocusEffect(refresh);

  async function handleRemove(title: string) {
    if (!userState) return;
    Alert.alert(
      'Remove from Shelf',
      `Are you sure you want to remove "${title}" from your saved shelf?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const next: State = {
              ...userState,
              saved: userState.saved.filter((x) => x !== title),
            };
            await saveState(next);
            setUserState(next);
          },
        },
      ]
    );
  }

  async function handleStartReading(title: string) {
    if (!userState) return;
    const isAlreadyReading = userState.reading.includes(title);
    if (!isAlreadyReading) {
      const next: State = {
        ...userState,
        reading: [...userState.reading, title],
        progress: {
          ...userState.progress,
          [title]: userState.progress[title] || 1,
        },
        finished: userState.finished.filter((x) => x !== title),
      };
      await saveState(next);
      setUserState(next);
    }
    router.push('/(tabs)/reading');
  }

  const savedList = userState?.saved || [];
  const readingList = userState?.reading || [];
  const finishedList = userState?.finished || [];

  // Filter books to display
  let displayTitles = savedList;
  if (filter === 'reading') {
    displayTitles = savedList.filter((t) => readingList.includes(t));
  } else if (filter === 'finished') {
    displayTitles = savedList.filter((t) => finishedList.includes(t));
  } else if (filter === 'saved') {
    displayTitles = savedList.filter(
      (t) => !readingList.includes(t) && !finishedList.includes(t)
    );
  }

  return (
    <Screen>
      <Header
        title="My Shelf"
        subtitle="Your private library preserved on this device"
      />

      {/* Stats Summary Row */}
      <View style={styles.statsRow}>
        <StatCard
          value={savedList.length}
          label="Saved"
          icon="bookmark-outline"
        />
        <StatCard
          value={readingList.length}
          label="Reading"
          icon="book-outline"
        />
        <StatCard
          value={finishedList.length}
          label="Finished"
          icon="checkmark-circle-outline"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        {(
          [
            { key: 'all', label: `All (${savedList.length})` },
            { key: 'saved', label: 'To Read' },
            { key: 'reading', label: 'Reading' },
            { key: 'finished', label: 'Finished' },
          ] as const
        ).map((tab) => {
          const isActive = filter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={[
                styles.filterTabBtn,
                isActive && styles.filterTabBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Book List or Empty State */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {displayTitles.length === 0 ? (
          <EmptyState
            icon="library-outline"
            title={
              savedList.length === 0
                ? 'Your shelf is waiting'
                : 'No books in this category'
            }
            description={
              savedList.length === 0
                ? 'Browse the collection and save books you would love to read.'
                : 'Switch filters or explore new titles to add to this shelf.'
            }
            actionLabel="Discover Books"
            onAction={() => router.push('/(tabs)/search')}
          />
        ) : (
          <View style={styles.cardsContainer}>
            {displayTitles.map((title, i) => {
              const meta = userState?.bookDetails?.[title];
              const isReading = readingList.includes(title);
              const isFinished = finishedList.includes(title);
              const progress = userState?.progress?.[title] || 0;

              return (
                <View key={title} style={styles.shelfBookCard}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/book/[id]',
                        params: {
                          id: encodeURIComponent(meta?.id || title),
                          title,
                          author: meta?.author || '',
                          cover: meta?.cover || '',
                          year: String(meta?.year || ''),
                        },
                      })
                    }
                    style={styles.cardCoverPress}
                  >
                    <BookCover
                      book={{
                        title,
                        author: meta?.author,
                        cover: meta?.cover,
                      }}
                      index={i}
                      size="sm"
                    />
                  </Pressable>

                  <View style={styles.cardDetails}>
                    <Text numberOfLines={2} style={styles.cardTitle}>
                      {title}
                    </Text>
                    {meta?.author ? (
                      <Text numberOfLines={1} style={styles.cardAuthor}>
                        {meta.author}
                      </Text>
                    ) : null}

                    {/* Status Badge */}
                    <View style={styles.badgeRow}>
                      {isFinished ? (
                        <Badge
                          label="Finished"
                          variant="primary"
                          icon="checkmark-circle"
                        />
                      ) : isReading ? (
                        <Badge
                          label={`${progress}% in progress`}
                          variant="amber"
                          icon="leaf"
                        />
                      ) : (
                        <Badge label="On Shelf" variant="surface" />
                      )}
                    </View>

                    {/* Actions */}
                    <View style={styles.cardActionsRow}>
                      {!isFinished ? (
                        <Pressable
                          onPress={() => handleStartReading(title)}
                          style={({ pressed }) => [
                            styles.smallActionBtn,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Ionicons
                            name="book-outline"
                            size={13}
                            color={C.primary}
                          />
                          <Text style={styles.smallActionBtnText}>
                            {isReading ? 'Track' : 'Read'}
                          </Text>
                        </Pressable>
                      ) : null}

                      <Pressable
                        onPress={() => handleRemove(title)}
                        style={({ pressed }) => [
                          styles.removeBtn,
                          pressed && styles.pressed,
                        ]}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={14}
                          color={C.danger}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabBtnActive: {
    backgroundColor: C.surfaceHighlight,
    borderColor: C.primaryDark,
  },
  filterTabText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: C.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
  },
  cardsContainer: {
    gap: 12,
  },
  shelfBookCard: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  cardCoverPress: {
    alignSelf: 'flex-start',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: C.cream,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  cardAuthor: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 8,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  smallActionBtnText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 6,
  },
  pressed: {
    opacity: 0.8,
  },
});
