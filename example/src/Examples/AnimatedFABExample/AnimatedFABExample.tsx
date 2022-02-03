import * as React from 'react';
import { View, StyleSheet, FlatList, Animated, Platform } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Colors, useTheme, Avatar, Paragraph, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { animatedFABExampleData } from '../../../utils';
import CustomFAB from './CustomFAB';
import CustomFABControls, {
  Controls,
  initialControls,
} from './CustomFABControls';

type Item = {
  id: string;
  sender: string;
  header: string;
  message: string;
  initials: string;
  date: string;
  read: boolean;
  favorite: boolean;
  bgColor: string;
};

const AnimatedFABExample = () => {
  const { colors, isV3, md } = useTheme();

  const isIOS = Platform.OS === 'ios';

  const [extended, setExtended] = React.useState<boolean>(true);
  const [visible, setVisible] = React.useState<boolean>(true);

  const [controls, setControls] = React.useState<Controls>(initialControls);

  const { current: velocity } = React.useRef<Animated.Value>(
    new Animated.Value(0)
  );

  const renderItem = React.useCallback(
    ({ item }: { item: Item }) => {
      const TextComponent = isV3 ? Text : Paragraph;

      return (
        <View style={styles.itemContainer}>
          <Avatar.Text
            style={[styles.avatar, { backgroundColor: item.bgColor }]}
            label={item.initials}
            color={Colors.white}
            size={40}
          />
          <View style={styles.itemTextContentContainer}>
            <View style={styles.itemHeaderContainer}>
              <TextComponent
                variant="label-large"
                style={[styles.header, !item.read && styles.read]}
                ellipsizeMode="tail"
                numberOfLines={1}
              >
                {item.sender}
              </TextComponent>
              <TextComponent
                variant="label-large"
                style={[styles.date, !item.read && styles.read]}
              >
                {item.date}
              </TextComponent>
            </View>

            <View style={styles.itemMessageContainer}>
              <View style={styles.flex}>
                <TextComponent
                  variant="label-large"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={!item.read && styles.read}
                >
                  {item.header}
                </TextComponent>
                <TextComponent
                  variant="label-large"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.message}
                </TextComponent>
              </View>

              <Icon
                name={item.favorite ? 'star' : 'star-outline'}
                color={item.favorite ? Colors.orange500 : Colors.grey500}
                size={20}
                onPress={() => setVisible(!visible)}
                style={styles.icon}
              />
            </View>
          </View>
        </View>
      );
    },
    [visible]
  );

  const onScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollPosition =
      Math.floor(nativeEvent?.contentOffset?.y) ?? 0;

    if (!isIOS) {
      return velocity.setValue(currentScrollPosition);
    }

    setExtended(currentScrollPosition <= 0);
  };

  const _keyExtractor = React.useCallback(
    (item: { id: string }) => item.id,
    []
  );

  const { animateFrom, iconMode } = controls;

  return (
    <>
      <CustomFABControls controls={controls} setControls={setControls} />
      <FlatList
        data={animatedFABExampleData}
        renderItem={renderItem}
        keyExtractor={_keyExtractor}
        onEndReachedThreshold={0}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={[
          styles.flex,
          {
            backgroundColor: isV3
              ? (md('md.sys.color.background') as string)
              : colors?.background,
          },
        ]}
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: isV3
              ? (md('md.sys.color.background') as string)
              : colors?.background,
          },
        ]}
        onScroll={onScroll}
      />

      <CustomFAB
        visible={visible}
        animatedValue={velocity}
        extended={extended}
        label={'New Message'}
        animateFrom={animateFrom}
        iconMode={iconMode}
      />
    </>
  );
};

AnimatedFABExample.title = 'Animated Floating Action Button';

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  avatar: {
    marginRight: 16,
    marginTop: 8,
  },
  flex: {
    flex: 1,
  },
  itemContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  itemTextContentContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  itemHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  read: {
    fontWeight: 'bold',
  },
  icon: {
    marginLeft: 16,
    alignSelf: 'flex-end',
  },
  date: {
    fontSize: 12,
  },
  header: {
    fontSize: 14,
    marginRight: 8,
    flex: 1,
  },
});

export default AnimatedFABExample;
