import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Switch } from 'react-router-dom';
import { useEffect } from 'react';
import { DashboardScreen } from './screens/DashboardScreen';
import { posthog } from './lib/posthog';

setupIonicReact({
  mode: 'ios',
  swipeBackEnabled: true,
  hardwareBackButton: true,
});

function App() {
  useEffect(() => {
    const initNative = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0d0d12' });
        await SplashScreen.hide();
      } catch (err) {
        // Plugins unavailable in browser (ionic serve)
        if (err instanceof Error && err.message && !err.message.includes('not implemented')) {
          posthog.captureException(err);
        }
      }
    };

    initNative();

    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      void backListener.then((l) => l.remove());
    };
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
          <Switch>
            <Route exact path="/" component={DashboardScreen} />
          </Switch>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
