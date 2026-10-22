import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Header,
  BookCover,
  Badge,
  Button,
  ProgressBar,
  C,
} from '../../components/ui';
import { loadState, saveState, saveBookMetadata, State } from '../../lib/store';

export default function BookDetails() {
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    author: string;
    cover: string;
    year: string;
  }>();

  const [userState, setUserState] = useState<State | null>(null);

  const title = String(params.title || 'Untitled Book');
  const author = String(params.author || 'Unknown Author');
  const cover = String(params.cover || '');
  const year = params.year ? String(params.year) : null;
  const bookId = String(params.id || title);

  useEffect(() => {
    loadState().then((s) => {
      // Automatically register metadata for this book so shelf & reading views have cover/author
      const updated = saveBookMetadata(s, {
        id: bookId,
        title,
        author,
        cover,
        year,
      });
      setUserState(updated);
      saveState(updated);
    });
  }, [bookId, title, author, cover, year]);

  const isSaved = userState?.saved.includes(title) || false;
  const isReading = userState?.reading.includes(title) || false;
  const isFinished = userState?.finished.includes(title) || false;
  const progress = userState?.progress[title] || 0;

  async function handleToggleSave() {
    if (!userState) return;
    const nextSaved = isSaved
      ? userState.saved.filter((x) => x !== title)
      : [...userState.saved, title];

    const next: State = {
      ...userState,
      saved: nextSaved,
    };
    await saveState(next);
    setUserState(next);

    Alert.alert(
      'BookGarden',
      isSaved
        ? `Removed "${title}" from your shelf.`
        : `Added "${title}" to your shelf.`
    );
  }

  async function handleToggleReading() {
    if (!userState) return;
    if (isReading) {
      router.push('/(tabs)/reading');
      return;
    }

    const next: State = {
      ...userState,
      saved: Array.from(new Set([...userState.saved, title])),
      reading: Array.from(new Set([...userState.reading, title])),
      progress: {
        ...userState.progress,
        [title]: userState.progress[title] || 5,
      },
      finished: userState.finished.filter((x) => x !== title),
    };
    await saveState(next);
    setUserState(next);

    Alert.alert(
      'Reading Journey Begun',
      `"${title}" is now on your reading table. Track your progress anytime in the Reading Garden.`
    );
  }

  return (
    <Screen>
      <Header
        title="Book Details"
        subtitle="Open Library catalogue"
        showBack
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.coverFrame}>
            <BookCover
              book={{ title, author, cover }}
              size="lg"
            />
          </View>

          <Text style={styles.bookTitle}>{title}</Text>
          <Text style={styles.bookAuthor}>{author}</Text>

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            {year ? <Badge label={`Published ${year}`} variant="surface" /> : null}
            {isFinished ? (
              <Badge
                label="Completed"
                variant="primary"
                icon="checkmark-circle"
              />
            ) : isReading ? (
              <Badge
                label={`${progress}% in progress`}
                variant="amber"
                icon="leaf"
              />
            ) : isSaved ? (
              <Badge
                label="On Your Shelf"
                variant="primary"
                icon="bookmark"
              />
            ) : null}
          </View>
        </View>

        {/* Progress Preview if in progress */}
        {isReading ? (
          <View style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <Text style={styles.progressCardTitle}>Current Reading Pace</Text>
              <Text style={styles.progressCardPercent}>{progress}%</Text>
            </View>
            <View style={{ marginTop: 8 }}>
              <ProgressBar progress={progress} height={8} />
            </View>
          </View>
        ) : null}

        {/* Actions Stack */}
        <View style={styles.actionSection}>
          <Button
            title={isSaved ? 'Saved to Shelf' : 'Add to My Shelf'}
            icon={isSaved ? 'bookmark' : 'bookmark-outline'}
            variant={isSaved ? 'secondary' : 'primary'}
            onPress={handleToggleSave}
          />

          <Button
            title={isReading ? 'Update Progress' : 'Start Reading'}
            icon="book-outline"
            variant="outline"
            onPress={handleToggleReading}
            style={{ marginTop: 10 }}
          />

          <Button
            title="Open Reading Garden"
            icon="leaf-outline"
            variant="ghost"
            onPress={() => router.push('/(tabs)/reading')}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* Informational Synopsis Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={18} color={C.primary} />
            <Text style={styles.infoTitle}>About This Edition</Text>
          </View>
          <Text style={styles.infoBody}>
            This volume is part of the Open Library public catalogue. Books
            added to BookGarden are stored securely in local device storage,
            giving you private reading records with zero trackers.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  coverFrame: {
    marginVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  bookTitle: {
    color: C.cream,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 28,
    paddingHorizontal: 12,
  },
  bookAuthor: {
    color: C.muted,
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCardTitle: {
    color: C.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  progressCardPercent: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  actionSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    color: C.cream,
    fontSize: 14,
    fontWeight: '700',
  },
  infoBody: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
