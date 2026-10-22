import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
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
  ProgressBar,
  Badge,
  Button,
  EmptyState,
  StatCard,
  C,
} from '../../components/ui';
import { loadState, saveState, State } from '../../lib/store';

export default function Reading() {
  const [userState, setUserState] = useState<State | null>(null);
  const [goalInput, setGoalInput] = useState('12');
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadState().then((s) => {
        setUserState(s);
        setGoalInput(String(s.goal || 12));
      });
    }, [])
  );

  async function updateProgress(title: string, percentage: number) {
    if (!userState) return;
    const isCompleted = percentage >= 100;
    const next: State = {
      ...userState,
      progress: {
        ...userState.progress,
        [title]: percentage,
      },
      finished: isCompleted
        ? Array.from(new Set([...userState.finished, title]))
        : userState.finished.filter((x) => x !== title),
      reading: isCompleted
        ? userState.reading.filter((x) => x !== title)
        : userState.reading,
    };
    await saveState(next);
    setUserState(next);

    if (isCompleted) {
      Alert.alert(
        'Congratulations!',
        `You completed "${title}". It has been added to your Finished shelf.`
      );
    }
  }

  async function handleSaveGoal() {
    if (!userState) return;
    const parsed = parseInt(goalInput, 10);
    const validGoal = isNaN(parsed) || parsed < 1 ? 12 : Math.min(365, parsed);
    const next: State = { ...userState, goal: validGoal };
    await saveState(next);
    setUserState(next);
    setIsEditingGoal(false);
    Alert.alert('Goal Saved', `Your annual reading goal is set to ${validGoal} books.`);
  }

  const finishedCount = userState?.finished.length || 0;
  const inProgressCount = userState?.reading.length || 0;
  const goalTarget = userState?.goal || 12;
  const goalPercent = Math.min(100, Math.round((finishedCount / goalTarget) * 100));

  return (
    <Screen>
      <Header
        title="Reading Garden"
        subtitle="Cultivate steady habits, one chapter at a time"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Metric Overview Row */}
        <View style={styles.statsRow}>
          <StatCard
            value={inProgressCount}
            label="In Progress"
            icon="book-outline"
          />
          <StatCard
            value={finishedCount}
            label="Finished"
            icon="checkmark-circle-outline"
          />
          <StatCard
            value={goalTarget}
            label="Target"
            icon="trophy-outline"
          />
        </View>

        {/* Annual Challenge Card */}
        <View style={styles.goalCard}>
          <View style={styles.goalTopRow}>
            <View>
              <Text style={styles.goalTitle}>Annual Reading Journey</Text>
              <Text style={styles.goalSub}>
                {finishedCount} of {goalTarget} books completed ({goalPercent}%)
              </Text>
            </View>
            <Pressable
              onPress={() => setIsEditingGoal(!isEditingGoal)}
              style={styles.editGoalBtn}
              hitSlop={8}
            >
              <Ionicons
                name={isEditingGoal ? 'close-outline' : 'pencil-outline'}
                size={16}
                color={C.primary}
              />
            </Pressable>
          </View>

          <View style={{ marginVertical: 12 }}>
            <ProgressBar progress={goalPercent} height={10} />
          </View>

          {isEditingGoal ? (
            <View style={styles.goalEditRow}>
              <TextInput
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="number-pad"
                placeholder="Target books"
                placeholderTextColor={C.muted}
                style={styles.goalInput}
              />
              <Pressable onPress={handleSaveGoal} style={styles.saveGoalBtn}>
                <Text style={styles.saveGoalBtnText}>Update</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Currently Cultivating Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Currently Reading</Text>
          <Badge
            label={`${inProgressCount} active`}
            variant={inProgressCount > 0 ? 'amber' : 'surface'}
          />
        </View>

        {inProgressCount === 0 ? (
          <EmptyState
            icon="leaf-outline"
            title="No books on your reading table"
            description="Pick a book from your shelf or discover fresh titles to track your daily progress."
            actionLabel="Browse Shelf"
            onAction={() => router.push('/(tabs)/shelf')}
          />
        ) : (
          <View style={styles.activeBooksList}>
            {userState?.reading.map((title, i) => {
              const meta = userState?.bookDetails?.[title];
              const progress = userState?.progress?.[title] || 0;

              return (
                <View key={title} style={styles.readingCard}>
                  <View style={styles.cardHeaderRow}>
                    <BookCover
                      book={{
                        title,
                        author: meta?.author,
                        cover: meta?.cover,
                      }}
                      index={i}
                      size="sm"
                    />
                    <View style={styles.cardInfoCol}>
                      <Text numberOfLines={2} style={styles.readingBookTitle}>
                        {title}
                      </Text>
                      {meta?.author ? (
                        <Text numberOfLines={1} style={styles.readingBookAuthor}>
                          {meta.author}
                        </Text>
                      ) : null}
                      <View style={styles.progressPercentRow}>
                        <Text style={styles.progressPercentText}>
                          {progress}% finished
                        </Text>
                        {progress >= 100 ? (
                          <Badge label="Complete" variant="primary" />
                        ) : null}
                      </View>
                      <View style={{ marginTop: 6 }}>
                        <ProgressBar progress={progress} height={6} />
                      </View>
                    </View>
                  </View>

                  {/* Progress Quick Jump Steppers */}
                  <View style={styles.stepperContainer}>
                    <Text style={styles.stepperLabel}>Quick Log Progress:</Text>
                    <View style={styles.stepperRow}>
                      {[10, 25, 50, 75, 100].map((step) => {
                        const isCurrent = progress === step;
                        return (
                          <Pressable
                            key={step}
                            onPress={() => updateProgress(title, step)}
                            style={[
                              styles.stepBtn,
                              isCurrent && styles.stepBtnActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.stepBtnText,
                                isCurrent && styles.stepBtnTextActive,
                              ]}
                            >
                              {step}%
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Finished Books Section */}
        {finishedCount > 0 ? (
          <View style={{ marginTop: 24 }}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Completed Shelves</Text>
              <Badge label={`${finishedCount} books`} variant="primary" />
            </View>

            <View style={styles.finishedList}>
              {userState?.finished.map((title, i) => {
                const meta = userState?.bookDetails?.[title];
                return (
                  <View key={title} style={styles.finishedRowItem}>
                    <View style={styles.finishedCheckCircle}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={C.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={styles.finishedTitle}>
                        {title}
                      </Text>
                      {meta?.author ? (
                        <Text numberOfLines={1} style={styles.finishedAuthor}>
                          {meta.author}
                        </Text>
                      ) : null}
                    </View>
                    <Badge label="Finished" variant="surface" />
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalTitle: {
    color: C.cream,
    fontSize: 16,
    fontWeight: '800',
  },
  goalSub: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  editGoalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalEditRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  goalInput: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    color: C.cream,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  saveGoalBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveGoalBtnText: {
    color: C.primaryText,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeading: {
    color: C.cream,
    fontSize: 18,
    fontWeight: '800',
  },
  activeBooksList: {
    gap: 14,
  },
  readingCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  readingBookTitle: {
    color: C.cream,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 19,
  },
  readingBookAuthor: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  progressPercentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressPercentText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  stepperContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  stepperLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnActive: {
    backgroundColor: C.primaryDark,
    borderColor: C.primary,
  },
  stepBtnText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  stepBtnTextActive: {
    color: C.primary,
  },
  finishedList: {
    gap: 8,
  },
  finishedRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  finishedCheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.primaryDark,
    borderWidth: 1,
    borderColor: 'rgba(157, 228, 136, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishedTitle: {
    color: C.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  finishedAuthor: {
    color: C.muted,
    fontSize: 11,
    marginTop: 1,
  },
});
