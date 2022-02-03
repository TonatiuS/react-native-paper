import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Paragraph, RadioButton, Text, useTheme } from 'react-native-paper';
import type {
  AnimatedFABAnimateFrom,
  AnimatedFABIconMode,
} from 'react-native-paper';

export type Controls = {
  iconMode: AnimatedFABIconMode;
  animateFrom: AnimatedFABAnimateFrom;
};

export const initialControls: Controls = {
  iconMode: 'static',
  animateFrom: 'right',
};

type Props = {
  controls: Controls;
  setControls(controls: React.SetStateAction<Controls>): void;
};

type ControlValue = AnimatedFABIconMode | AnimatedFABAnimateFrom;

type CustomControlProps = {
  name: string;
  options: ControlValue[];
  value: ControlValue;
  onChange(newValue: ControlValue): void;
};

const CustomControl = ({
  name,
  options,
  value,
  onChange,
}: CustomControlProps) => {
  const { isV3 } = useTheme();

  const _renderItem = React.useCallback(
    ({ item }) => {
      const TextComponent = isV3 ? Text : Paragraph;

      return (
        <View style={styles.controlItem}>
          <TextComponent variant="label-large">{item}</TextComponent>

          <RadioButton
            value="dynamic"
            status={value === item ? 'checked' : 'unchecked'}
            onPress={() => onChange(item)}
          />
        </View>
      );
    },
    [value, onChange, isV3]
  );

  const _keyExtractor = React.useCallback((item) => item, []);
  const TextComponent = isV3 ? Text : Paragraph;

  return (
    <View style={styles.controlWrapper}>
      <TextComponent variant="label-large">{name}</TextComponent>

      <FlatList
        horizontal
        data={options}
        renderItem={_renderItem}
        keyExtractor={_keyExtractor}
        contentContainerStyle={styles.controlItemsList}
      />
    </View>
  );
};

const CustomFABControls = ({
  setControls,
  controls: { animateFrom, iconMode },
}: Props) => {
  const { md, isV3, colors } = useTheme();

  const setIconMode = (newIconMode: AnimatedFABIconMode) =>
    setControls((state) => ({ ...state, iconMode: newIconMode }));

  const setAnimateFrom = (newAnimateFrom: AnimatedFABAnimateFrom) =>
    setControls((state) => ({ ...state, animateFrom: newAnimateFrom }));

  return (
    <View
      style={[
        styles.controlsWrapper,
        {
          backgroundColor: isV3
            ? (md('md.sys.color.background') as string)
            : colors?.background,
        },
      ]}
    >
      <CustomControl
        name="iconMode"
        options={['static', 'dynamic']}
        value={iconMode}
        onChange={setIconMode}
      />

      <CustomControl
        name="animateFrom"
        options={['left', 'right']}
        value={animateFrom}
        onChange={setAnimateFrom}
      />
    </View>
  );
};

export default CustomFABControls;

const styles = StyleSheet.create({
  controlsWrapper: {
    paddingHorizontal: 16,
  },
  controlWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlItemsList: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  controlItem: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
