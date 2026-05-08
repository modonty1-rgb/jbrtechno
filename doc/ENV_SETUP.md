# Environment Variables Setup

## Required Environment Variables

Add these variables to your `.env` file:

### Database
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"
```

### Cloudinary (for file uploads)
```env
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Public Environment Variables
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
```

### WhatsApp Contact Button
```env
# Format: Country code + phone number without + or spaces
# Example for Saudi Arabia: 966501234567
# Example for Egypt: 201234567890
NEXT_PUBLIC_WHATSAPP_NUMBER="966501234567"
```

## How to Add WhatsApp Number

1. Get your WhatsApp business number
2. Remove all spaces, dashes, and the + sign
3. Add country code at the beginning
4. Add to `.env` file as `NEXT_PUBLIC_WHATSAPP_NUMBER`

### Examples:
- 🇸🇦 Saudi Arabia: `+966 50 123 4567` → `966501234567`
- 🇪🇬 Egypt: `+20 123 456 7890` → 201234567890
- 🇦🇪 UAE: `+971 50 123 4567` → 971501234567
- 🇰🇼 Kuwait: `+965 1234 5678` → 96512345678

## Testing

After adding the WhatsApp number, restart your development server:

```bash
pnpm dev
```

The WhatsApp floating button should appear in the bottom-right corner of all public pages.

