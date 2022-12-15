import * as React from 'react';
import { useRef } from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ChooseWalletTypeModal,
  ChooseWalletTypeModalRef,
  fetchWallets,
  walletConnect,
  WalletModel,
} from 'react-native-wallet-connect';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [result, setResult] = React.useState<WalletModel[]>([]);
  const ref = useRef<ChooseWalletTypeModalRef>(null);

  React.useEffect(() => {
    fetchWallets().then((t) => setResult(t.data));
  }, []);

  const connect = async (wallet?: WalletModel) => {
    console.log('connect', wallet);
    const wallets = await walletConnect.connect({
      bridge: 'https://bridge.walletconnect.org',
      name: 'NFSee',
      description: 'Connect your wallet',
      icon: 'https://uploads-ssl.webflow.com/6321ad9f31f654a13eb13aa8/6329b49598dd316f58fda057_Favicon.png',
      url: 'https://www.nfsee.io',
      wallet: wallet?.universalLink,
    });
    console.log('[App.1]', wallets);
    if (wallets.type === 'success') {
      const t = await walletConnect.personalSign({
        address: wallets.addresses[0]!,
        message: 'smth',
        bridge: 'https://bridge.walletconnect.org',
        wallet: wallet?.universalLink,
      });
      console.log('[App.2]', t);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'android') connect();
              else ref.current?.present();
            }}
          >
            <Text>Present</Text>
          </TouchableOpacity>
        </View>

        <ChooseWalletTypeModal
          ref={ref}
          backgroundColor={'white'}
          titleColor={'black'}
          height={400}
          backdropOpacity={0.5}
          supportedWallets={result}
          onAddWalletPress={connect}
        />
        {/*<FlatList data={} renderItem={} showsVerticalScrollIndicator={}/>*/}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
