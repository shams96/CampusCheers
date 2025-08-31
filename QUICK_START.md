# CampusCheers - Quick Local Testing Guide

## 🚀 Fastest Way to Test (No External Services Required)

### Option 1: Local Development (Recommended)

#### Step 1: Start the Database
```bash
# Make sure Docker is running, then:
docker-compose up -d
```

#### Step 2: Start the Backend Server
```bash
cd server
npm install
npm start
```
✅ **Backend will run on:** `http://localhost:3001`

#### Step 3: Start the Frontend
```bash
# In a new terminal (don't close the backend):
npm install --legacy-peer-deps
npm run dev
```
✅ **Frontend will run on:** `http://localhost:3000`

#### Step 4: Test the App
1. **Open your browser** and go to: `http://localhost:3000`
2. **Click "Get Started"** to begin
3. **Try the Hype Round** - vote through all 12 polls
4. **Check your results** on the Results page

---

### Option 2: Network Access (Test on Phone)

If you want to test on your phone or share with someone on your local network:

#### Step 1: Find Your Local IP
```bash
# On Windows:
ipconfig

# Look for your local IP address (something like 192.168.1.xxx)
```

#### Step 2: Update Frontend to Listen on All Interfaces
```bash
# In your frontend terminal, stop the dev server (Ctrl+C)
# Then restart with:
npm run dev -- -H 0.0.0.0
```

#### Step 3: Access from Other Devices
- **On your phone/tablet:** `http://YOUR_LOCAL_IP:3000`
- **On another computer:** `http://YOUR_LOCAL_IP:3000`

---

### Option 3: Automated Setup Script

I've created a simple script to make setup even easier:

```bash
# Run this in the project root:
./setup-and-test.sh
```

Or manually:
```bash
# One command setup (run in project root):
docker-compose up -d && cd server && npm install && npm start &
cd .. && npm install --legacy-peer-deps && npm run dev
```

---

## 🧪 What to Test

### Core User Flow
1. **Landing Page** → Click "Get Started"
2. **Dashboard** → Click "Start Hype Round"
3. **Hype Round** → Vote on all 12 polls
4. **Results** → View your cheers

### Mobile Testing
- Test on your phone using the network access method above
- Check button sizes and touch targets
- Test the new loading states and error handling

### Error Scenarios
- Try refreshing during voting
- Test with slow connection
- Check error recovery

---

## 📱 Mobile Testing Made Easy

### Test on Your Phone (Same WiFi Network)
1. Get your computer's local IP (see Option 2 above)
2. On your phone, visit: `http://YOUR_IP:3000`
3. Test all the mobile improvements we made!

### No Phone? Test in Browser
1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (phone/tablet icon)
3. Select different devices to test responsiveness

---

## 🔧 Troubleshooting

### Backend Won't Start?
```bash
# Check if port 3001 is in use:
netstat -ano | findstr :3001

# Kill the process if needed:
taskkill /PID <PID_NUMBER> /F
```

### Frontend Won't Start?
```bash
# Clear node modules and reinstall:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Database Issues?
```bash
# Reset the database:
docker-compose down
docker-compose up -d
cd server && npx prisma migrate deploy
```

---

## 🎯 Quick Test Checklist

- [ ] Landing page loads and explains the concept clearly
- [ ] Buttons are easy to tap on mobile
- [ ] Hype Round voting works smoothly
- [ ] Loading states show during actions
- [ ] Error handling works (try refreshing during voting)
- [ ] Results page displays properly
- [ ] Mobile layout looks good

---

## 📞 Need Help?

If you run into any issues:
1. Check the troubleshooting section above
2. Make sure Docker is running
3. Try restarting both servers
4. Check the browser console for errors (F12 → Console)

**No external services, no payments, just local testing!** 🎉