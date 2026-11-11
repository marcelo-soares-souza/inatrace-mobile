import { Stack, router, useSegments } from 'expo-router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { AuthContext } from '@/context/AuthContext';
import i18n from '@/locales/i18n';

import Mapbox from '@rnmapbox/maps';

type OfflinePack = NonNullable<
  Awaited<ReturnType<typeof Mapbox.offlineManager.getPack>>
>;
import HeaderBackButton from '@/components/common/HeaderBackButton';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '');

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function AppLayout() {
  const { checkAuth, accessToken, guestAccess, logInGuest } =
    useContext(AuthContext);

  const segments = useSegments();

  const hasNavigatedToMapDownload = useRef(false);
  const hasNavigatedToDefaultFarmer = useRef(false);

  const prevAccessToken = useRef(accessToken);
  const prevSegments = useRef(segments);

  useEffect(() => {
    if (
      prevAccessToken.current !== accessToken ||
      JSON.stringify(prevSegments.current) !== JSON.stringify(segments)
    ) {
      handleAuthCheck();
      prevAccessToken.current = accessToken;
      prevSegments.current = segments;
    }
  }, [segments, accessToken]);

  const handleAuthCheck = useCallback(async () => {
    if (guestAccess) {
      await checkForOfflineMaps();
      return;
    }

    if (accessToken === 'none') {
      await handleLoginGuest();
    } else if (accessToken) {
      const isAuth = await checkAuth();

      if (!isAuth) {
        await handleLoginGuest();
      } else {
        await checkForOfflineMaps();
      }
    }
  }, [accessToken, segments]);

  const handleLoginGuest = async () => {
    await logInGuest();
    if (!hasNavigatedToDefaultFarmer.current) {
      hasNavigatedToDefaultFarmer.current = true;
      router.push('/(app)/(farmers)/info/0');
    }
  };

  const checkForOfflineMaps = async () => {
    // Only offer the offline-map onboarding from the entry screen. Running
    // this on every segment change would override navigations such as the
    // plot form after Save plot shape.
    if (segments.length > 1) {
      return;
    }

    try {
      const packs: OfflinePack[] = await Mapbox.offlineManager.getPacks();
      if (packs.length === 0 && !hasNavigatedToMapDownload.current) {
        hasNavigatedToMapDownload.current = true;
        router.push('/map-download');
      }
    } catch (error) {
      console.error('Error fetching offline packs:', error);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerTransparent: { ios: false },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="data-sync"
        options={{
          presentation: 'modal',
          title: i18n.t('home.syncData'),
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen name="(farmers)" options={{ headerShown: false }} />
      <Stack.Screen
        name="user-settings"
        options={{
          presentation: 'modal',
          title: i18n.t('userSettings.title'),
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="map-download"
        options={{
          presentation: 'modal',
          title: i18n.t('plots.mapDownload'),
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
