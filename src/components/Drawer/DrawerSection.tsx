import color from 'color';
import * as React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import Text from '../Typography/Text';
import Divider from '../Divider';
import { withTheme } from '../../core/theming';
import type { Theme } from '../../types';
import { tokens } from '../../styles/themes/v3/tokens';

type Props = React.ComponentPropsWithRef<typeof View> & {
  /**
   * Title to show as the header for the section.
   */
  title?: string;
  /**
   * Content of the `Drawer.Section`.
   */
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * @optional
   */
  theme: Theme;
};

/**
 * A component to group content inside a navigation drawer.
 *
 * <div class="screenshots">
 *   <figure>
 *     <img class="medium" src="screenshots/drawer-section.png" />
 *   </figure>
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { Drawer } from 'react-native-paper';
 *
 * const MyComponent = () => {
 *   const [active, setActive] = React.useState('');
 *
 *
 *   return (
 *     <Drawer.Section title="Some title">
 *       <Drawer.Item
 *         label="First Item"
 *         active={active === 'first'}
 *         onPress={() => setActive('first')}
 *       />
 *       <Drawer.Item
 *         label="Second Item"
 *         active={active === 'second'}
 *         onPress={() => setActive('second')}
 *       />
 *     </Drawer.Section>
 *   );
 * };
 *
 * export default MyComponent;
 * ```
 */
const DrawerSection = ({ children, title, theme, style, ...rest }: Props) => {
  const { colors, fonts, isV3, md } = theme;
  const titleColor = isV3
    ? (md('md.sys.color.on-surface-variant') as string)
    : color(colors?.text).alpha(0.54).rgb().string();
  const font = fonts.medium;

  return (
    <View style={[styles.container, style]} {...rest}>
      {title && (
        <View style={[styles.titleContainer, isV3 && styles.v3TitleContainer]}>
          {title && (
            <Text
              variant="title-small"
              numberOfLines={1}
              style={[
                { color: titleColor, ...font },
                styles.title,
                isV3 && styles.v3Title,
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      )}
      {children}
      <Divider
        {...(isV3 && { insets: true, bold: true })}
        style={isV3 ? styles.v3Divider : styles.divider}
      />
    </View>
  );
};

DrawerSection.displayName = 'Drawer.Section';

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  titleContainer: {
    height: 40,
    justifyContent: 'center',
  },
  v3TitleContainer: {
    height: 56,
  },
  title: {
    marginLeft: 16,
  },
  v3Title: {
    marginLeft: 28,
  },
  divider: {
    marginTop: 4,
  },
  v3Divider: {
    backgroundColor: tokens.md.ref.palette['neutral-variant50'],
  },
});

export default withTheme(DrawerSection);
