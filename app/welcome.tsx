import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, C } from '../components/ui';

export default function Welcome() {
  async function handleStart() {
    await AsyncStorage.setItem('bg_onboarded', 'yes');
    router.replace('/(tabs)');
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <Ionicons name="leaf" size={16} color={C.primary} />
            <Text style={styles.brandText}>BookGarden</Text>
          </View>
        </View>

        <View style={styles.heroArtwork}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIconCircle}>
            <Ionicons name="book" size={48} color={C.primary} />
          </View>
          <View style={styles.heroSubRow}>
            <View style={styles.microBadge}>
              <Ionicons name="sparkles" size={12} color={C.amber} />
              <Text style={styles.microBadgeText}>Quiet Reading Sanctuary</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>
          Cultivate your{'\n'}reading sanctuary.
        </Text>
        <Text style={styles.subtitle}>
          A serene space to discover thoughtful literature, cherish your favorite
          shelves, and nurture mindful reading habits.
        </Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconWrap}>
              <Ionicons name="compass-outline" size={18} color={C.primary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Curated Discovery</Text>
              <Text style={styles.featureDesc}>
                Explore millions of works from Open Library across classic and modern genres.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconWrap}>
              <Ionicons name="albums-outline" size={18} color={C.primary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Private Personal Shelf</Text>
              <Text style={styles.featureDesc}>
                Save books offline directly to your device with instant access anytime.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconWrap}>
              <Ionicons name="trending-up-outline" size={18} color={C.primary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Mindful Pace & Goals</Text>
              <Text style={styles.featureDesc}>
                Track current progress and celebrate every completed chapter with quiet pride.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="Enter BookGarden"
            icon="arrow-forward"
            onPress={handleStart}
          />
          <Text style={styles.footerNote}>
            YOUR PRIVATE READING NOOK ON THIS DEVICE
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: C.bg,
  },
  content: {
    paddingBottom: 40,
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  brandText: {
    color: C.cream,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroArtwork: {
    height: 180,
    borderRadius: 24,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(157, 228, 136, 0.08)',
  },
  heroIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSubRow: {
    position: 'absolute',
    bottom: 12,
  },
  microBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.amberDark,
    borderColor: 'rgba(229, 190, 122, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  microBadgeText: {
    color: C.amber,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: C.cream,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 24,
  },
  featureList: {
    gap: 14,
    marginBottom: 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157, 228, 136, 0.2)',
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    color: C.cream,
    fontSize: 14,
    fontWeight: '700',
  },
  featureDesc: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 6,
  },
  footerNote: {
    color: C.subtle,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 18,
  },
});
