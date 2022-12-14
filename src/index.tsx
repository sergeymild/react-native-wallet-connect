import { NativeModules, Platform } from 'react-native';

export { fetchWallets, WalletModel } from './registry';
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

interface SignParamsModel {
  readonly bridge: string;
  readonly message: string;
  readonly address: string;
  readonly wallet?: string;
}

export const walletConnect = {
  personalSign(params: SignParamsModel) {
    return new Promise((resolve) => {
      WalletConnect.personalSign(params, resolve);
    });
  },

  connect(
    params: ParamsModel
  ): Promise<
    { type: 'error'; error: string } | { type: 'success'; addresses: string[] }
  > {
    return new Promise((resolve) => {
      WalletConnect.connect(params, resolve);
    });
  },

  disconnect() {
    WalletConnect.disconnect();
  },
};
