# Email Troubleshooting Guide

If OTP emails are not arriving in Gmail, follow these steps:

## Step 1: Check Backend Console

When you start your server, you should see:
```
✅ Email Config: ✅ Configured
Email User: your-email@gmail.com
Email Host: smtp.gmail.com
```

If you see `❌ Not configured`, your `.env` file is missing email settings.

## Step 2: Verify .env File

Make sure your `backend/.env` file has these variables:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

**Important:**
- `EMAIL_USER` should be your full Gmail address
- `EMAIL_PASS` should be a 16-character App Password (NOT your regular Gmail password)
- `EMAIL_FROM` should match `EMAIL_USER`

## Step 3: Check Server Logs

When you request an OTP, check your backend console. You should see:

**If email is configured:**
```
✅ Email sent successfully: { messageId: '...', to: 'user@example.com', ... }
```

**If email fails:**
```
❌ Email sending failed: { error: '...', code: '...', ... }
```

**If email is NOT configured:**
```
📧 EMAIL VERIFICATION OTP (DEV MODE)
Email: user@example.com
OTP Code: 123456
⚠️  Email not configured. Add EMAIL_USER and EMAIL_PASS to .env
```

## Step 4: Verify Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Make sure you have an app password generated
3. Copy the 16-character password (remove spaces if any)
4. Paste it in `.env` as `EMAIL_PASS`

**Common mistakes:**
- Using regular Gmail password instead of App Password
- Including spaces in the App Password
- Not enabling 2-Step Verification first

## Step 5: Check Gmail Settings

1. **Check Spam Folder**: Sometimes emails go to spam
2. **Check All Mail**: Search for "StockFlow IMS" in Gmail
3. **Check Filters**: Make sure no filters are blocking emails

## Step 6: Test Email Connection

Restart your server and look for this message on startup:
```
Email server is ready to send messages
```

If you see an error instead, the email configuration is incorrect.

## Common Error Messages

### "Invalid login"
- **Cause**: Wrong password or using regular password instead of App Password
- **Fix**: Generate a new App Password and use that

### "Connection timeout"
- **Cause**: Firewall or network blocking port 587
- **Fix**: Check firewall settings, try port 465 with `EMAIL_SECURE=true`

### "Authentication failed"
- **Cause**: App Password is incorrect or expired
- **Fix**: Generate a new App Password

### "Email transporter not initialized"
- **Cause**: `EMAIL_USER` or `EMAIL_PASS` not set in `.env`
- **Fix**: Add both variables to `.env` and restart server

## Quick Test

1. **Check if email is configured:**
   ```bash
   # In backend directory
   node -e "require('dotenv/config'); console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'); console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');"
   ```

2. **Request OTP and check console:**
   - Go to registration page
   - Enter email and request OTP
   - Check backend console for email status

3. **Check Gmail:**
   - Check inbox
   - Check spam folder
   - Search for "StockFlow IMS"

## Still Not Working?

1. **Restart server** after changing `.env`
2. **Clear browser cache** and try again
3. **Check backend console** for detailed error messages
4. **Verify App Password** is correct (regenerate if needed)
5. **Try a different email** to test if it's account-specific

## Alternative: Use Console OTP (Development)

If you can't configure Gmail right now, the system will show OTP in the console:

```
📧 EMAIL VERIFICATION OTP (DEV MODE)
===========================================
Email: user@example.com
OTP Code: 123456
===========================================
```

Copy the OTP from the console and use it to verify.

