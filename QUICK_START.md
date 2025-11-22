# HealSync Frontend - Quick Start Guide 🚀

## Prerequisites Check ✅
Before starting, ensure you have:
- ✅ Node.js (v14 or higher) installed
- ✅ Backend server running on `http://localhost:5000`
- ✅ MongoDB running on `mongodb://localhost:27017/healsyncfinal`

## Step 1: Start the Backend (In Terminal 1)
```bash
cd backend
npm run dev
```
**Expected Output:**
```
✔️ MongoDB connected successfully to localhost:27017/healsyncfinal
✔️ Reminder scheduler initialized
✔️ Socket.IO initialized
✔️ Server running on port 5000
```

## Step 2: Start the Frontend (In Terminal 2)
```bash
cd frontend
npm start
```
**Expected Output:**
```
✔️ Webpack compiled successfully
✔️ Local: http://localhost:3000
✔️ On Your Network: http://192.168.x.x:3000
```

## Step 3: Access the Application
Open your browser and navigate to: **http://localhost:3000**

---

## 🧪 Testing the Application

### Test 1: Patient Registration & Login
1. **Landing Page** → Click "Get Started as Patient"
2. **Register** → Fill form:
   - Name: John Doe
   - Email: patient@test.com
   - Password: Test@123
   - Phone: 1234567890
   - Date of Birth: 1990-01-01
3. **Verify Email** → Check email for verification link (or use backend route)
4. **Login** → Use credentials to login
5. **Dashboard** → Should see patient dashboard with stats

### Test 2: Create a Reminder
1. Navigate to **Reminders** tab
2. Click **+ Add New Reminder**
3. Fill the form:
   - Medicine Name: Aspirin
   - Dosage: 100mg
   - Frequency: Daily
   - Time: 08:00 AM
   - Start Date: Today
4. Click **Create** → Should see reminder in list
5. **Real-time Test:** Wait for reminder time → Should get Socket.IO notification

### Test 3: Upload Document with AI Analysis
1. Navigate to **Documents** tab
2. Click **Upload Document**
3. Select a medical document (PDF/Image)
4. Wait for upload → Should see document in list
5. Click **View AI Analysis** → Should display OCR + Llama 3.1 analysis

### Test 4: AI Chat
1. Navigate to **AI Chat** tab
2. Type a medical question: "What are the symptoms of diabetes?"
3. Press Send → Should receive AI-generated response
4. Chat history should persist

### Test 5: Health Tracking
1. Navigate to **Health Tracking** tab
2. Click **BP** tab → Click **Add Reading**
   - Systolic: 120
   - Diastolic: 80
3. Click **Sugar** tab → Click **Add Reading**
   - Glucose Level: 95 mg/dL
4. Should see readings in respective tabs

### Test 6: Access Control
1. Navigate to **Access Control** tab
2. Click **Generate QR Code** → Should display QR code
3. Click **Generate Token** → Should display access token
4. **Test Revocation:** Click revoke on a token → Should disappear

### Test 7: Find Pharmacies
1. Navigate to **Pharmacies** tab
2. Enter location: "New York"
3. Search for medicine: "Aspirin"
4. Should see list of nearby pharmacies

### Test 8: Theme Toggle
1. Click **moon icon** in sidebar → Should switch to dark theme
2. Click **sun icon** → Should switch to light theme
3. Refresh page → Theme preference should persist

---

## 🩺 Test Doctor Interface

### Doctor Registration & Login
1. **Landing Page** → Click "Join as Doctor"
2. **Register** → Fill form:
   - Name: Dr. Smith
   - Email: doctor@test.com
   - Password: Test@123
   - Specialty: Cardiology
   - License Number: DOC12345
3. **Verify Email** → Check email for verification
4. **Login** → Use credentials
5. **Dashboard** → Should see doctor dashboard with stats

### Test Doctor Features
1. **Dashboard** → View stats and recent activities
2. **Patients** → Search for patients by name/email
3. **Theme Toggle** → Test dark/light mode

---

## 💊 Test Pharmacy Interface

### Pharmacy Registration & Login
1. **Landing Page** → Click "Register as Pharmacy"
2. **Register** → Fill form:
   - Pharmacy Name: MediCare Pharmacy
   - Email: pharmacy@test.com
   - Password: Test@123
   - Phone: 9876543210
   - License: PHARM123
3. **Login** → Use credentials
4. **Dashboard** → Should see pharmacy dashboard

### Test Pharmacy Features
1. **Dashboard** → View inventory stats and orders
2. **Inventory** → Click **+ Add Medicine**
   - Name: Paracetamol
   - Manufacturer: ABC Pharma
   - Dosage Form: Tablet
   - Strength: 500mg
   - Price: 10
   - Stock: 100
3. **Update Stock** → Click edit on medicine → Change stock
4. **Delete** → Click delete on medicine → Should remove from list

---

## 🎨 Theme Color Reference

### Light Theme Colors
- **Primary (Deep Twilight):** `#03045e` - Headers, primary buttons
- **Secondary (Bright Teal):** `#0077b6` - Links, accents
- **Accent (Turquoise Surf):** `#00b4d8` - Hover states
- **Light Accent (Frosted Blue):** `#90e0ef` - Backgrounds
- **Background (Light Cyan):** `#caf0f8` - Main background

### Dark Theme Colors
- **Primary (Light Cyan):** `#e0fbfc` - Text, icons
- **Secondary (Light Blue):** `#c2dfe3` - Secondary text
- **Accent (Cool Steel):** `#9db4c0` - Borders, dividers
- **Dark Accent (Blue Slate):** `#5c6b73` - Card backgrounds
- **Background (Jet Black):** `#253237` - Main background

---

## 🔧 Troubleshooting

### Problem: Frontend won't start
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Problem: "Network Error" on API calls
**Solution:**
1. Check backend is running on port 5000
2. Verify MongoDB is connected
3. Check `frontend/src/services/api.js` has correct baseURL

### Problem: Socket.IO notifications not working
**Solution:**
1. Check Socket.IO initialized in backend logs
2. Verify Socket context in `App.js` is working
3. Check browser console for WebSocket errors

### Problem: Theme toggle not persisting
**Solution:**
1. Check localStorage is enabled in browser
2. Clear browser cache and try again
3. Check ThemeContext in browser devtools

### Problem: Authentication not working
**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Logout and login again
3. Check JWT token in localStorage
4. Verify backend JWT secret matches

### Problem: File upload fails
**Solution:**
1. Check file size (max 10MB)
2. Verify Cloudinary credentials in backend `.env`
3. Check network tab for error details

---

## 📝 API Endpoint Reference

All endpoints are prefixed with `http://localhost:5000/api/v1`

### Patient Endpoints
- `POST /login` - Patient login
- `POST /signup` - Patient registration
- `POST /createReminder` - Create reminder
- `GET /listReminders` - Get all reminders
- `PUT /updateReminder/:id` - Update reminder
- `DELETE /deleteReminder/:id` - Delete reminder
- `POST /createDocument` - Upload document
- `POST /chat` - AI chat

### Doctor Endpoints
- `POST /doctor/login` - Doctor login
- `POST /doctor/register` - Doctor registration
- `GET /doctor/dashboard` - Doctor stats

### Pharmacy Endpoints
- `POST /pharmacy/login` - Pharmacy login
- `POST /pharmacy/register` - Pharmacy registration
- `GET /pharmacy/inventory` - Get inventory
- `POST /pharmacy/medicine` - Add medicine

---

## 🚨 Common Test Scenarios

### Scenario 1: End-to-End Patient Flow
```
1. Register → 2. Verify Email → 3. Login → 4. Create Reminder → 
5. Upload Document → 6. Chat with AI → 7. Add Health Reading → 
8. Generate QR Code → 9. Toggle Theme → 10. Logout
```

### Scenario 2: Real-time Reminder Notification
```
1. Create reminder with time 2 minutes from now →
2. Wait for reminder time →
3. Should receive Socket.IO notification →
4. Notification should appear in top-right corner
```

### Scenario 3: Multi-user Test
```
1. Open browser window 1 → Login as Patient
2. Open browser window 2 → Login as Doctor
3. Open browser window 3 → Login as Pharmacy
4. Test all features simultaneously
```

---

## 📊 Expected Performance

- **Page Load Time:** < 2 seconds
- **API Response Time:** < 500ms
- **Socket.IO Latency:** < 100ms
- **File Upload Time:** < 5 seconds (for 5MB file)
- **Theme Toggle:** Instant (< 100ms)

---

## 🎯 Success Criteria

✅ All 3 user types can register and login
✅ Reminders CRUD operations work
✅ Real-time Socket.IO notifications appear
✅ Document upload with AI analysis works
✅ AI chat responds correctly
✅ Health tracking saves data
✅ Access control QR codes generate
✅ Pharmacy search works
✅ Theme toggle persists
✅ No console errors in browser
✅ All API calls succeed (200/201 status)

---

## 🆘 Need Help?

1. **Check Backend Logs:** Look for errors in backend terminal
2. **Check Browser Console:** Press F12 → Console tab
3. **Check Network Tab:** Press F12 → Network tab → Filter by "XHR"
4. **Review API Service:** Check `frontend/src/services/apiService.js`
5. **Verify Environment:** Ensure all prerequisites are met

---

## 🎉 You're All Set!

If all tests pass, your HealSync application is fully functional! Enjoy the super cool dark/light theme and explore all three interfaces.

**Happy Testing! 🚀**
