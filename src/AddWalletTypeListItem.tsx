import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { WalletModel } from './registry';

interface Props {
  readonly item: WalletModel;
  readonly onPress: () => void;
  readonly titleColor: string;
}

export const AddWalletTypeListItem: React.FC<Props> = memo((props) => {
  return (
    <TouchableOpacity
      style={[styles.listItem, { marginBottom: 4 }]}
      onPress={props.onPress}
    >
      {!!props.item.logo && (
        <Image source={{ uri: props.item.logo }} style={styles.icon} />
      )}
      <Text
        children={props.item.name}
        numberOfLines={1}
        ellipsizeMode={'middle'}
        style={[styles.title, { color: props.titleColor }]}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 72,
  },

  icon: {
    width: 46,
    height: 46,
    borderRadius: 8,
  },

  title: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
});
