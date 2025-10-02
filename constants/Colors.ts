import React from 'react';

export const PRIMARY_BLACK_COLOR = '#011501';
export const PRIMARY_GREEN_COLOR = '#b0d943';
export const PRIMARY_TEXT_GRAY = '#666666';
export const PRIMARY_RED_COLOR = '#dc3545';
export const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.8)';
export const WHITE_COLOR = 'white';
export const INPUT_BACKGROUND_COLOR = '#0a1a0a';
export const INPUT_BORDER_COLOR = '#ccc';
export const PLACEHOLDER_COLOR = '#888';
export const CANCEL_BORDER_COLOR = '#666';

const tintColorLight = PRIMARY_GREEN_COLOR;
const tintColorDark = PRIMARY_GREEN_COLOR;

export default {
  light: {
    text: PRIMARY_BLACK_COLOR,
    background: WHITE_COLOR,
    tint: tintColorLight,
    tabIconDefault: PRIMARY_TEXT_GRAY,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: WHITE_COLOR,
    background: PRIMARY_BLACK_COLOR,
    tint: tintColorDark,
    tabIconDefault: PRIMARY_TEXT_GRAY,
    tabIconSelected: tintColorDark,
  },
};
