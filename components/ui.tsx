import React, { PropsWithChildren, ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const C = {
  bg: '#0a120c',
  surface: '#121e15',
  surfaceElevated: '#17271b',
  surfaceHighlight: '#1f3424',
  border: '#1f3323',
  borderLight: '#2c4732',
  primary: '#9de488',
  primaryDark: '#16361a',
  primaryText: '#0a1a0c',
  cream: '#f4efe6',
  muted: '#9db0a0',
  subtle: '#657a69',
  amber: '#e5be7a',
  amberDark: '#2c2314',
  danger: '#f28b82',
  dangerDark: '#2c1517',
};

export const COVER_PALETTES = [
  '#233a2a',
  '#3d2e20',
  '#20323c',
  '#422e22',
  '#32253c',
  '#1e3630',
];

interface ScreenProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
}

export function Screen({ children, style, noPadding = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        s.screen,
        {
          paddingTop: insets.top,
          paddingLeft: noPadding ? 0 : 20,
          paddingRight: noPadding ? 0 : 20,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Header({
  title,
  subtitle,
  showBack = false,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}) {
  return (
    <View style={s.headerContainer}>
      <View style={s.headerTopRow}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.iconBtn, pressed && s.btnPressed]}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color={C.cream} />
          </Pressable>
        ) : null}
        <View style={s.headerTextCol}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={s.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {rightAction ? <View style={s.headerRight}>{rightAction}</View> : null}
      </View>
    </View>
  );
}

export function BookCover({
  book,
  index = 0,
  size = 'md',
}: {
  book: { title: string; author?: string; cover?: string };
  index?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dimensions =
    size === 'sm'
      ? { width: 68, height: 96, radius: 8 }
      : size === 'lg'
      ? { width: 148, height: 216, radius: 14 }
      : { width: 114, height: 164, radius: 12 };

  const bg = COVER_PALETTES[index % COVER_PALETTES.length];

  return (
    <View
      style={[
        s.coverBase,
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.radius,
          backgroundColor: bg,
        },
      ]}
    >
      {book.cover ? (
        <Image
          source={{ uri: book.cover }}
          resizeMode="cover"
          style={[
            s.coverImage,
            {
              width: dimensions.width,
              height: dimensions.height,
              borderRadius: dimensions.radius,
            },
          ]}
        />
      ) : (
        <View style={[s.coverFallback, { padding: size === 'sm' ? 6 : 10 }]}>
          <View style={s.coverTopOrnament}>
            <Ionicons
              name="book-outline"
              size={size === 'sm' ? 14 : 20}
              color={C.primary}
            />
          </View>
          <Text
            numberOfLines={size === 'sm' ? 2 : 3}
            style={[
              s.coverFallbackTitle,
              { fontSize: size === 'sm' ? 10 : 12, lineHeight: size === 'sm' ? 13 : 16 },
            ]}
          >
            {book.title}
          </Text>
          {size !== 'sm' && book.author ? (
            <Text numberOfLines={1} style={s.coverFallbackAuthor}>
              {book.author}
            </Text>
          ) : null}
          <Text style={[s.coverBrandTag, { fontSize: size === 'sm' ? 6 : 8 }]}>
            BOOKGARDEN
          </Text>
        </View>
      )}
    </View>
  );
}

export function Badge({
  label,
  variant = 'surface',
  icon,
}: {
  label: string;
  variant?: 'primary' | 'surface' | 'amber' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const bg =
    variant === 'primary'
      ? C.primaryDark
      : variant === 'amber'
      ? C.amberDark
      : variant === 'danger'
      ? C.dangerDark
      : C.surfaceHighlight;

  const color =
    variant === 'primary'
      ? C.primary
      : variant === 'amber'
      ? C.amber
      : variant === 'danger'
      ? C.danger
      : C.muted;

  const borderColor =
    variant === 'primary'
      ? 'rgba(157, 228, 136, 0.25)'
      : variant === 'amber'
      ? 'rgba(229, 190, 122, 0.25)'
      : variant === 'danger'
      ? 'rgba(242, 139, 130, 0.25)'
      : C.border;

  return (
    <View style={[s.badge, { backgroundColor: bg, borderColor }]}>
      {icon ? (
        <Ionicons name={icon} size={11} color={color} style={{ marginRight: 4 }} />
      ) : null}
      <Text style={[s.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({
  progress,
  height = 8,
}: {
  progress: number;
  height?: number;
}) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <View style={[s.progressTrack, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          s.progressFill,
          { width: `${clamped}%`, height, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

export function StatCard({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={s.statCard}>
      <View style={s.statTopRow}>
        <Text style={s.statValue}>{value}</Text>
        <Ionicons name={icon} size={18} color={C.primary} />
      </View>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  const btnBg = isPrimary
    ? C.primary
    : isSecondary
    ? C.surfaceElevated
    : isDanger
    ? C.dangerDark
    : isGhost
    ? 'transparent'
    : C.surface;

  const textColor = isPrimary
    ? C.primaryText
    : isDanger
    ? C.danger
    : isOutline || isSecondary
    ? C.cream
    : C.primary;

  const borderColor = isOutline
    ? C.borderLight
    : isDanger
    ? 'rgba(242, 139, 130, 0.3)'
    : isSecondary
    ? C.border
    : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        s.btn,
        {
          backgroundColor: btnBg,
          borderColor,
          borderWidth: isOutline || isDanger || isSecondary ? 1 : 0,
        },
        pressed && s.btnPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={s.btnInner}>
          {icon ? (
            <Ionicons
              name={icon}
              size={17}
              color={textColor}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text style={[s.btnText, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={s.emptyContainer}>
      <View style={s.emptyIconCircle}>
        <Ionicons name={icon} size={32} color={C.primary} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptyDesc}>{description}</Text>
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          style={{ marginTop: 16 }}
        />
      ) : null}
    </View>
  );
}

export function Loading({ message }: { message?: string }) {
  return (
    <View style={s.loadingContainer}>
      <ActivityIndicator size="large" color={C.primary} />
      {message ? <Text style={s.loadingText}>{message}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    color: C.cream,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: C.muted,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  headerRight: {
    marginLeft: 10,
  },
  coverBase: {
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  coverFallback: {
    flex: 1,
    justifyContent: 'space-between',
  },
  coverTopOrnament: {
    alignSelf: 'flex-start',
  },
  coverFallbackTitle: {
    color: '#fff9ed',
    fontWeight: '700',
  },
  coverFallbackAuthor: {
    color: '#c2cebf',
    fontSize: 10,
  },
  coverBrandTag: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '800',
    letterSpacing: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  progressTrack: {
    width: '100%',
    backgroundColor: C.surfaceHighlight,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: C.primary,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    borderRadius: 14,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    color: C.cream,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginVertical: 12,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: C.cream,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDesc: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
  loadingContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: C.muted,
    fontSize: 13,
    marginTop: 10,
  },
});
