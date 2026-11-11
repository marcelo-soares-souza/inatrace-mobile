import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

import Topbar from '@/components/common/Topbar';
import HomeNavButton from '@/components/home/HomeNavButton';
import SessionNotice from '@/components/home/SessionNotice';
import FarmerSvg from '@/components/svg/FarmerSvg';
import PlotSvg from '@/components/svg/PlotSvg';

import i18n from '@/locales/i18n';
import SyncDataButton from '@/components/home/SyncDataButton';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';

export default function Home() {
  const [_, setLocale] = useState(i18n.locale);
  const { sessionState, logInGuest } = useContext(AuthContext);

  const authenticated = sessionState === 'authenticated';
  const navHint =
    sessionState === 'guest'
      ? i18n.t('home.sessionNotice.navGuestArea')
      : i18n.t('home.sessionNotice.navLoginRequired');

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLocale(i18n.locale);
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView
      className="flex flex-col justify-between h-full bg-Background"
      edges={{ top: 'maximum' }}
    >
      <Topbar title={i18n.t('home.title')} />
      <View className="flex flex-col">
        <HomeNavButton
          title={i18n.t('home.farmers')}
          icon={FarmerSvg}
          link="/(farmers)/farmers"
          disabled={!authenticated}
          hint={navHint}
        />
        <HomeNavButton
          title={i18n.t('home.newPlot')}
          icon={PlotSvg}
          link="/(farmers)/newplot"
          disabled={!authenticated}
          hint={navHint}
        />
      </View>
      <View>
        <SessionNotice
          state={sessionState}
          onGuest={() => {
            void logInGuest();
          }}
        />
        <View className="pb-5 border-t bg-White border-t-LightGray">
          <SyncDataButton />
        </View>
      </View>
    </SafeAreaView>
  );
}
