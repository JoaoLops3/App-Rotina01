import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Switch } from 'react-router-dom';
import { useEffect } from 'react';
import { DashboardScreen } from './screens/DashboardScreen';

// Initialize Ionic React with custom settings
setupIonicReact({
  mode: 'ios',
  swipeBackEnabled: true,
  hardwareBackButton: true,
});

function App() {
  useEffect(() => {
    const configureStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0d0d12' });
      } catch {
        // StatusBar not available on web platform
      }
    };
    configureStatusBar();
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
