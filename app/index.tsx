import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { C } from '../components/ui';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('bg_onboarded')
      .then((v) => {
        setSeen(v === 'yes');
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: C.bg,
        }}
      >
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return <Redirect href={seen ? '/(tabs)' : '/welcome'} />;
}

