import * as React from 'react';
import color from 'color';
import {
  Animated,
  View,
  ViewStyle,
  StyleSheet,
  StyleProp,
  Easing,
  ScrollView,
  Text,
  Platform,
  I18nManager,
} from 'react-native';
import Surface from '../../Surface';
import Icon from '../../Icon';
import TouchableRipple from '../../TouchableRipple/TouchableRipple';
import type { $RemoveChildren, Theme } from '../../../types';
import type { IconSource } from '../../Icon';
import { withTheme } from '../../../core/theming';
import type {
  AccessibilityState,
  NativeSyntheticEvent,
  TextLayoutEventData,
} from 'react-native';
import AnimatedText from '../../Typography/v2/AnimatedText';
import { getCombinedStyles } from './utils';
import { getFABColors } from './utils';
import type { FABVariant } from '.';

export type AnimatedFABIconMode = 'static' | 'dynamic';
export type AnimatedFABAnimateFrom = 'left' | 'right';

type Props = $RemoveChildren<typeof Surface> &
  MD3Props & {
    /**
     * Icon to display for the `FAB`.
     */
    icon: IconSource;
    /**
     * Label for extended `FAB`.
     */
    label: string;
    /**
     * Make the label text uppercased.
     */
    uppercase?: boolean;
    /**
     * Accessibility label for the FAB. This is read by the screen reader when the user taps the FAB.
     * Uses `label` by default if specified.
     */
    accessibilityLabel?: string;
    /**
     * Accessibility state for the FAB. This is read by the screen reader when the user taps the FAB.
     */
    accessibilityState?: AccessibilityState;
    /**
     * Custom color for the icon and label of the `FAB`.
     */
    color?: string;
    /**
     * Whether `FAB` is disabled. A disabled button is greyed out and `onPress` is not called on touch.
     */
    disabled?: boolean;
    /**
     * Whether `FAB` is currently visible.
     */
    visible?: boolean;
    /**
     * Function to execute on press.
     */
    onPress?: () => void;
    /**
     * Function to execute on long press.
     */
    onLongPress?: () => void;
    /**
     * Whether icon should be translated to the end of extended `FAB` or be static and stay in the same place. The default value is `dynamic`.
     */
    iconMode?: AnimatedFABIconMode;
    /**
     * Indicates from which direction animation should be performed. The default value is `right`.
     */
    animateFrom?: AnimatedFABAnimateFrom;
    /**
     * Whether `FAB` should start animation to extend.
     */
    extended: boolean;
    style?: StyleProp<ViewStyle>;
    /**
     * @optional
     */
    theme: Theme;
    testID?: string;
  };

type MD3Props = {
  variant?: FABVariant;
};

const SIZE = 56;
const SCALE = 0.9;

const AnimatedFAB = ({
  icon,
  label,
  accessibilityLabel = label,
  accessibilityState,
  color: customColor,
  disabled,
  onPress,
  onLongPress,
  theme,
  style,
  visible = true,
  uppercase = !theme.isV3,
  testID,
  animateFrom = 'right',
  extended = false,
  iconMode = 'dynamic',
  variant = 'primary',
  ...rest
}: Props) => {
  const isIOS = Platform.OS === 'ios';
  const isAnimatedFromRight = animateFrom === 'right';
  const isIconStatic = iconMode === 'static';
  const { isRTL } = I18nManager;
  const { current: visibility } = React.useRef<Animated.Value>(
    new Animated.Value(visible ? 1 : 0)
  );
  const { current: animFAB } = React.useRef<Animated.Value>(
    new Animated.Value(0)
  );
  const { scale } = theme.animation;
  const { isV3 } = theme;

  const [textWidth, setTextWidth] = React.useState<number>(0);
  const [textHeight, setTextHeight] = React.useState<number>(0);

  const borderRadius = SIZE / (isV3 ? 3.5 : 2);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(visibility, {
        toValue: 1,
        duration: 200 * scale,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(visibility, {
        toValue: 0,
        duration: 150 * scale,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scale, visibility]);

  const { backgroundColor, foregroundColor } = getFABColors(
    theme,
    variant,
    disabled,
    customColor,
    style
  );

  const rippleColor = color(foregroundColor).alpha(0.32).rgb().string();

  const extendedWidth = textWidth + SIZE + borderRadius;

  const distance = isAnimatedFromRight
    ? -textWidth - borderRadius
    : textWidth + borderRadius;

  React.useEffect(() => {
    Animated.timing(animFAB, {
      toValue: !extended ? 0 : distance,
      duration: 150 * scale,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }, [animFAB, scale, distance, extended]);

  const onTextLayout = ({
    nativeEvent,
  }: NativeSyntheticEvent<TextLayoutEventData>) => {
    const currentWidth = Math.ceil(nativeEvent.lines[0].width);
    const currentHeight = Math.ceil(nativeEvent.lines[0].height);

    if (currentWidth !== textWidth || currentHeight !== textHeight) {
      setTextHeight(currentHeight);

      if (isIOS) {
        return setTextWidth(currentWidth - 12);
      }

      setTextWidth(currentWidth);
    }
  };

  const propForDirection = <T,>(right: T[]): T[] => {
    if (isAnimatedFromRight) {
      return right;
    }

    return right.reverse();
  };

  const combinedStyles = getCombinedStyles({
    isAnimatedFromRight,
    isIconStatic,
    distance,
    animFAB,
  });

  return (
    <Surface
      {...rest}
      style={
        [
          {
            opacity: visibility,
            transform: [
              {
                scale: visibility,
              },
            ],
            elevation: isIOS ? 6 : 0,
            borderRadius,
          },
          styles.container,
          disabled && styles.disabled,
          style,
        ] as StyleProp<ViewStyle>
      }
    >
      <Animated.View
        style={[
          {
            transform: [
              {
                scaleY: animFAB.interpolate({
                  inputRange: propForDirection([distance, 0]),
                  outputRange: propForDirection([SCALE, 1]),
                }),
              },
            ],
          },
          styles.standard,
          { borderRadius },
        ]}
      >
        <View style={[StyleSheet.absoluteFill, styles.shadowWrapper]}>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.shadow,
              {
                width: extendedWidth,
                opacity: animFAB.interpolate({
                  inputRange: propForDirection([distance, 0.9 * distance, 0]),
                  outputRange: propForDirection([1, 0.15, 0]),
                }),
                borderRadius,
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.shadow,
              {
                opacity: animFAB.interpolate({
                  inputRange: propForDirection([distance, 0.9 * distance, 0]),
                  outputRange: propForDirection([0, 0.85, 1]),
                }),
                width: SIZE,
                borderRadius: animFAB.interpolate({
                  inputRange: propForDirection([distance, 0]),
                  outputRange: propForDirection([
                    SIZE / (extendedWidth / SIZE),
                    borderRadius,
                  ]),
                }),
              },
              combinedStyles.absoluteFill,
            ]}
          />
        </View>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.innerWrapper, { borderRadius }]}
        >
          <Animated.View
            style={[
              styles.standard,
              {
                width: extendedWidth,
                backgroundColor,
                borderRadius,
              },
              combinedStyles.innerWrapper,
            ]}
          >
            <TouchableRipple
              borderless
              onPress={onPress}
              onLongPress={onLongPress}
              rippleColor={rippleColor}
              disabled={disabled}
              accessibilityLabel={accessibilityLabel}
              // @ts-expect-error We keep old a11y props for backwards compat with old RN versions
              accessibilityTraits={disabled ? ['button', 'disabled'] : 'button'}
              accessibilityComponentType="button"
              accessibilityRole="button"
              accessibilityState={{ ...accessibilityState, disabled }}
              testID={testID}
              style={{ borderRadius }}
            >
              <View
                style={[
                  styles.standard,
                  {
                    width: extendedWidth,
                    borderRadius,
                  },
                ]}
              />
            </TouchableRipple>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[styles.iconWrapper, combinedStyles.iconWrapper]}
        pointerEvents="none"
      >
        <Icon source={icon} size={24} color={foregroundColor} />
      </Animated.View>

      <View pointerEvents="none">
        <AnimatedText
          numberOfLines={1}
          onTextLayout={isIOS ? onTextLayout : undefined}
          ellipsizeMode={'tail'}
          style={[
            {
              [isAnimatedFromRight || isRTL ? 'right' : 'left']: isIconStatic
                ? textWidth - SIZE + borderRadius / (isV3 ? 1 : 2)
                : borderRadius,
            },
            {
              minWidth: textWidth,
              top: -SIZE / 2 - textHeight / 2,
              opacity: animFAB.interpolate({
                inputRange: propForDirection([distance, 0.7 * distance, 0]),
                outputRange: propForDirection([1, 0, 0]),
              }),
              transform: [
                {
                  translateX: animFAB.interpolate({
                    inputRange: propForDirection([distance, 0]),
                    outputRange: propForDirection([0, SIZE]),
                  }),
                },
              ],
            },
            styles.label,
            uppercase && styles.uppercaseLabel,
            {
              color: foregroundColor,
              ...theme.fonts.medium,
            },
          ]}
        >
          {label}
        </AnimatedText>
      </View>

      {!isIOS && (
        // Method `onTextLayout` on Android returns sizes of text visible on the screen,
        // however during render the text in `FAB` isn't fully visible. In order to get
        // proper text measurements there is a need to additionaly render that text, but
        // wrapped in absolutely positioned `ScrollView` which height is 0.
        <ScrollView style={styles.textPlaceholderContainer}>
          <Text onTextLayout={onTextLayout}>{label}</Text>
        </ScrollView>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  standard: {
    height: SIZE,
  },
  disabled: {
    elevation: 0,
  },
  container: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  innerWrapper: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  shadowWrapper: {
    elevation: 0,
  },
  shadow: {
    elevation: 6,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    height: SIZE,
    width: SIZE,
  },
  label: {
    position: 'absolute',
  },
  uppercaseLabel: {
    textTransform: 'uppercase',
  },
  textPlaceholderContainer: {
    height: 0,
    position: 'absolute',
  },
});

export default withTheme(AnimatedFAB);
