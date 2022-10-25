import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Dimensions, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { AddWalletTypeListItem } from './AddWalletTypeListItem';
import type { WalletModel } from './registry';

interface Props {
  readonly onAddWalletPress: (item: WalletModel) => void;
  readonly supportedWallets: WalletModel[];
  readonly backgroundColor: string;
  readonly titleColor: string;
  readonly height: number;
  readonly backdropOpacity?: number;
}

export interface ChooseWalletTypeModalRef {
  present: () => void;
  dismiss: () => void;
}

export const ChooseWalletTypeModal = forwardRef<
  ChooseWalletTypeModalRef,
  Props
>((props, ref) => {
  const [present, setPresent] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);
  useImperativeHandle(ref, () => ({
    present: () => {
      setPresent(true);
    },
    dismiss: () => {
      setPresent(false);
    },
  }));

  useEffect(() => {
    if (sheetRef.current) {
      if (present) sheetRef.current?.present();
      else sheetRef.current?.dismiss();
    }
  }, [present, sheetRef.current]);

  const backdrop = useCallback(
    (p: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...p}
        //opacity={props.overlayOpacity}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={props.backdropOpacity}
      />
    ),
    []
  );

  if (!present) return null;

  const wallets = props.supportedWallets;
  let width = Dimensions.get('window').width - 72;
  let l = Math.min(5, Math.round(width / 72));
  width = l * 72;

  console.log('[AddPortfolioChooseWalletTypeBottomSheet.]', l, width / 72);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['100%']}
      animateOnMount
      enableOverDrag={false}
      handleComponent={null}
      enablePanDownToClose
      backdropComponent={backdrop}
      backgroundComponent={null}
      onDismiss={() => setPresent(false)}
    >
      {/*<SimpleBottomSheetHeader*/}
      {/*  isFullScreen={false}*/}
      {/*  title={*/}
      {/*    <View style={{ flex: 1 }}>*/}
      {/*      <AppIcon*/}
      {/*        type={'icWalletConnectTitle'}*/}
      {/*        style={{ alignSelf: 'center' }}*/}
      {/*      />*/}
      {/*    </View>*/}
      {/*  }*/}
      {/*/>*/}
      <View style={styles.container}>
        <View
          style={{
            width: width + 16,
            minHeight: props.height,
            backgroundColor: props.backgroundColor,
            borderRadius: 8,
          }}
        >
          <BottomSheetFlatList<WalletModel>
            data={wallets}
            numColumns={l}
            windowSize={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 16,
              paddingHorizontal: 8,
            }}
            renderItem={(info: ListRenderItemInfo<WalletModel>) => (
              <AddWalletTypeListItem
                titleColor={props.titleColor}
                item={info.item}
                onPress={() => {
                  sheetRef.current?.dismiss();
                  props.onAddWalletPress?.(info.item);
                }}
              />
            )}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
