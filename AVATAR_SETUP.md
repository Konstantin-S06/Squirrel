# Avatar Setup Instructions

## Adding Your Squirrel Image

1. **Place your squirrel image in the `public` folder:**
   - File should be named: `squirrel-boxing.png`
   - Path: `public/squirrel-boxing.png`

2. **Image Requirements:**
   - Recommended: PNG format with transparent background
   - Recommended size: 512x512px or larger (square)
   - The image should show the squirrel with boxing gloves

## Avatar Customization Features

The avatar editor now supports:

### ✅ Squirrel Body Color
- 8 preset colors (Brown, Gray, Black, Red, Blonde, White, Green, Blue)
- Custom color picker for any color
- Uses CSS filters to tint the squirrel image

### ✅ Glove Color
- 12 preset colors (Red, Blue, Green, Purple, Yellow, Orange, Pink, Black, White, Gold, Silver, Teal)
- Custom color picker for any color
- Separate color control for the boxing gloves

### ✅ Accessories (Toggle On/Off)
- 🕶️ **Glasses** - Sunglasses on the squirrel
- 🎩 **Hat** - Top hat
- 🧣 **Scarf** - Scarf around neck
- 🏅 **Badge** - Achievement badge on chest

## How It Works

1. The base squirrel image is loaded from `/squirrel-boxing.png`
2. CSS `hue-rotate` filter is applied to change the squirrel's color
3. A color overlay with blend modes tints the gloves separately
4. Accessory emojis are layered on top at specific positions

## Future Enhancements

The system is designed to easily add:
- More accessory options
- Different squirrel poses/expressions
- Additional color customization options
- Animation effects
- Custom accessories (upload images)

## Notes

- All settings are saved to localStorage
- Settings persist across sessions
- The preview updates in real-time as you make changes
