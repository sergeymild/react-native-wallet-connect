import { NativeModules, Platform } from 'react-native';

export { fetchWallets } from './registry';
export {
  ChooseWalletTypeModal,
  ChooseWalletTypeModalRef,
} from './ChooseWalletTypeModal';

const LINKING_ERROR =
  `The package 'react-native-wallet-connect' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const WalletConnect = NativeModules.WalletConnect
  ? NativeModules.WalletConnect
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

interface ParamsModel {
  readonly bridge: string;
  readonly wallet?: string;
  readonly name: string;
  readonly description: string;
  readonly icon?: string;
  readonly url: string;
}

function formatIOSMobile(uri: string, universalLink: string) {
  const encodedUri = encodeURIComponent(uri);
  return `${universalLink}/wc?uri=${encodedUri}`;
}

export function walletConnect(
  params: ParamsModel
): Promise<
  { type: 'error'; error: string } | { type: 'success'; addresses: string[] }
> {
  return new Promise((resolve) => {
    WalletConnect.connect(params, resolve);
  });
}
