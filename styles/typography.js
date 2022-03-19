import { Dimensions, Platform, PixelRatio } from 'react-native';

const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 410;

export function normalize(size) {
  const newSize = size * scale 
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1
  }
}

const size = {
    XXXS: normalize(4),
    XXS: normalize(10),
    XS: normalize(14),
    S: normalize(16),
    SM: normalize(18),
    M : normalize(25),
    L: normalize(30),
    XXL: normalize(80)
  };
  
  const letterSpacing = {
    S: 2,
    M: 5,
    L: 10,
  };
  
  export const typography = {size, letterSpacing};