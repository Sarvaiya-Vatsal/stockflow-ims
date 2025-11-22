# Email Setup Guide for StockFlow IMS

This guide will help you configure Gmail to send OTP emails for email verification and password reset.

## Gmail App Password Setup

Gmail requires an "App Password" instead of your regular password for SMTP authentication.

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the prompts to enable 2-Step Verification

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "StockFlow IMS" as the name
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Configure .env File

In your `backend/.env` file, add:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM=your-email@gmail.com
```

**Important:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with the 16-character app password (remove spaces if any)
- Use the same email for both `EMAIL_USER` and `EMAIL_FROM`

### Step 4: Restart Server

After updating the `.env` file, restart your backend server:

```bash
cd backend
npm start
```

### Testing

1. Try registering a new user
2. Check your email inbox for the OTP
3. If emails don't arrive, check:
   - Spam folder
   - Backend console for error messages
   - That the app password is correct (no spaces)

## Alternative Email Providers

If you prefer not to use Gmail, you can use other SMTP providers:

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Custom SMTP
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## Troubleshooting

**Error: "Invalid login"**
- Make sure you're using an App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled

**Error: "Connection timeout"**
- Check your firewall settings
- Verify EMAIL_PORT is correct (587 for TLS, 465 for SSL)

**Emails not arriving**
- Check spam folder
- Verify EMAIL_USER and EMAIL_FROM match
- Check backend console for error messages
- Test with a different email provider

