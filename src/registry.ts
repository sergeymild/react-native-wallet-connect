const API_URL = 'https://registry.walletconnect.com';
export function getWalletRegistryUrl() {
  return `${API_URL}/api/v2/wallets`;
}

interface EntryModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly image_url: Record<'sm' | 'md' | 'lg', string>;
  readonly mobile: { native: string | null; universal: string | null };
  readonly metadata: {
    shortName: string | null;
    colors: { primary: string | null };
  };
}

export interface WalletModel {
  id: string;
  name?: string;
  shortName?: string;
  color?: string;
  logo?: string;
  universalLink?: string;
  deepLink?: string;
}

function formatMobileRegistryEntry(entry: EntryModel): WalletModel {
  return {
    id: entry.id,
    name: entry.name || '',
    shortName: entry.metadata.shortName || '',
    color: entry.metadata.colors.primary || '',
    logo: entry.image_url.sm ?? '',
    universalLink: entry.mobile.universal || '',
    deepLink: entry.mobile.native || '',
  };
}

export function formatMobileRegistry(registry: EntryModel[]): WalletModel[] {
  return Object.values(registry)
    .filter((entry) => !!entry.mobile.universal || !!entry.mobile.native)
    .map((entry) => formatMobileRegistryEntry(entry));
}

let wallets: WalletModel[] = [];
export async function fetchWallets(): Promise<
  | {
      type: 'success';
      data: WalletModel[];
    }
  | { type: 'error'; data: Error }
> {
  try {
    if (wallets.length > 0) return { type: 'success', data: wallets };
    const response = await fetch(getWalletRegistryUrl());
    const json = await response.json();
    wallets = formatMobileRegistry(json.listings);
    return { type: 'success', data: wallets };
  } catch (e) {
    return { type: 'error', data: e as Error };
  }
}
