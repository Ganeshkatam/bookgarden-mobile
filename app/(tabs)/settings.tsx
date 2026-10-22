import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Header,
  Badge,
  Button,
  C,
} from '../../components/ui';
import { emptyState, loadState, saveState, State } from '../../lib/store';

export default function Settings() {
  const [userState, setUserState] = useState<State | null>(null);

  useEffect(() => {
    loadState().then(setUserState);
  }, []);

  async function adjustGoal(delta: number) {
    if (!userState) return;
    const current = userState.goal || 12;
    const newGoal = Math.max(1, Math.min(365, current + delta));
    const next: State = { ...userState, goal: newGoal };
    await saveState(next);
    setUserState(next);
  }

  function handleResetData() {
    Alert.alert(
      'Reset Reading Data?',
      'This will clear your saved shelf, reading progress, and finished history from this device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await saveState(emptyState);
            setUserState(emptyState);
            Alert.alert(
              'Reset Complete',
              'Your local BookGarden reading records have been cleared.'
            );
          },
        },
      ]
    );
  }

  async function handleReplayWelcome() {
    await AsyncStorage.removeItem('bg_onboarded');
    router.replace('/welcome');
  }

  return (
    <Screen>
      <Header
        title="Settings"
        subtitle="Manage reading goals, storage, and preferences"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section: Reading Goals */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="trophy-outline" size={18} color={C.primary} />
            <Text style={styles.sectionTitle}>Annual Reading Target</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Set your target number of books to complete this year.
          </Text>

          <View style={styles.stepperBox}>
            <Pressable
              onPress={() => adjustGoal(-1)}
              style={({ pressed }) => [
                styles.adjustBtn,
                pressed && styles.pressed,
              ]}
              hitSlop={8}
            >
              <Ionicons name="remove" size={20} color={C.cream} />
            </Pressable>
            <View style={styles.goalDisplay}>
              <Text style={styles.goalNumberText}>
                {userState?.goal || 12}
              </Text>
              <Text style={styles.goalUnitText}>books / year</Text>
            </View>
            <Pressable
              onPress={() => adjustGoal(1)}
              style={({ pressed }) => [
                styles.adjustBtn,
                pressed && styles.pressed,
              ]}
              hitSlop={8}
            >
              <Ionicons name="add" size={20} color={C.cream} />
            </Pressable>
          </View>
        </View>

        {/* Section: Local Storage & Privacy */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={C.primary} />
            <Text style={styles.sectionTitle}>Privacy & Storage</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Your reading notes and shelf collections remain stored entirely on
            this device. No accounts, advertising trackers, or external sync.
          </Text>

          <View style={styles.storageSummaryRow}>
            <View style={styles.storageItem}>
              <Text style={styles.storageVal}>
                {userState?.saved.length || 0}
              </Text>
              <Text style={styles.storageLabel}>Saved</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageVal}>
                {userState?.reading.length || 0}
              </Text>
              <Text style={styles.storageLabel}>Reading</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageVal}>
                {userState?.finished.length || 0}
              </Text>
              <Text style={styles.storageLabel}>Finished</Text>
            </View>
          </View>

          <Button
            title="Reset Local Reading Records"
            icon="trash-outline"
            variant="danger"
            onPress={handleResetData}
            style={{ marginTop: 14 }}
          />
        </View>

        {/* Section: App Flow */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="sparkles-outline" size={18} color={C.primary} />
            <Text style={styles.sectionTitle}>App Experience</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Revisit the onboarding introduction walkthrough anytime.
          </Text>
          <Button
            title="Replay Welcome Screen"
            icon="play-back-outline"
            variant="outline"
            onPress={handleReplayWelcome}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Section: About */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="information-circle-outline" size={18} color={C.muted} />
            <Text style={styles.sectionTitle}>About BookGarden</Text>
          </View>
          <Text style={styles.aboutText}>
            BookGarden Mobile · Version 1.0.0{'\n'}
            Crafted for readers, scholars, and curious minds.{'\n'}
            Powered by the Open Library public catalogue.
          </Text>
          <View style={{ marginTop: 10 }}>
            <Badge label="Expo SDK 57 · React Native 0.86" variant="surface" />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    color: C.cream,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDesc: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  adjustBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalDisplay: {
    alignItems: 'center',
  },
  goalNumberText: {
    color: C.cream,
    fontSize: 22,
    fontWeight: '800',
  },
  goalUnitText: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },
  storageSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  storageItem: {
    flex: 1,
    backgroundColor: C.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  storageVal: {
    color: C.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  storageLabel: {
    color: C.muted,
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  aboutText: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
