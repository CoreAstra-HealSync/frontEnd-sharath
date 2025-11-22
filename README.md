# 🏥 HealSync Frontend

A modern, professional React frontend for the HealSync healthcare management system with light/dark theme support.

## ✨ Features

### 🎨 Design
- **Dual Theme System**: Professional light and dark themes with smooth transitions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, minimalist interface with beautiful gradients and animations
- **Consistent Styling**: Unified design language across all components

### 👥 Three User Interfaces

#### 1. **Patient Dashboard**
- 📅 **Reminders**: Create, manage, and track medical appointments and medication reminders
- 📄 **Documents**: Upload medical documents with AI-powered analysis (OCR + Llama 3.1)
- 🤖 **AI Chat**: Interactive health assistant for medical queries
- 📊 **Health Tracking**: Monitor blood pressure and blood sugar levels
- 🔒 **Access Control**: Share medical records securely with QR codes
- 💊 **Pharmacies**: Find nearby pharmacies and search for medicines

#### 2. **Doctor Dashboard**
- 👥 Patient management and medical records access
- 📋 Appointment scheduling
- 📊 Medical reports and analytics

#### 3. **Pharmacy Dashboard**
- 💊 Medicine inventory management
- 📦 Stock tracking and updates
- 🏪 Pharmacy information management

### 🔔 Real-Time Features
- Socket.IO integration for instant notifications
- Live reminder alerts
- Real-time updates across the application

### 🔐 Security
- JWT authentication
- Protected routes for each user role
- Secure API communication
- Token-based access control

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Backend server running on `http://localhost:5000`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable components
│   │   ├── Sidebar.js
│   │   ├── Sidebar.css
│   │   ├── ProtectedRoute.js
│   │   └── ProtectedRoute.css
│   ├── context/            # React Context providers
│   │   ├── ThemeContext.js
│   │   ├── AuthContext.js
│   │   └── SocketContext.js
│   ├── pages/              # Page components
│   │   ├── Landing/
│   │   ├── Auth/
│   │   ├── Patient/
│   │   ├── Doctor/
│   │   └── Pharmacy/
│   ├── services/           # API services
│   │   ├── api.js
│   │   └── apiService.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🎨 Color Scheme

### Light Theme
- Deep Twilight: `#03045eff`
- Bright Teal Blue: `#0077b6ff`
- Turquoise Surf: `#00b4d8ff`
- Frosted Blue: `#90e0efff`
- Light Cyan: `#caf0f8ff`

### Dark Theme
- Light Cyan: `#e0fbfcff`
- Light Blue: `#c2dfe3ff`
- Cool Steel: `#9db4c0ff`
- Blue Slate: `#5c6b73ff`
- Jet Black: `#253237ff`

## 🔧 Configuration

### Environment Variables

The frontend is configured to connect to:
- **Backend API**: `http://localhost:5000/api`
- **Socket.IO**: `http://localhost:5000`

To change these, edit:
- `src/services/api.js` for API baseURL
- `src/context/SocketContext.js` for Socket.IO URL

## 📦 Dependencies

### Core
- `react` & `react-dom` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `socket.io-client` - Real-time communication

### UI & Utilities
- `react-icons` - Icon library
- `react-toastify` - Toast notifications
- `qrcode.react` - QR code generation
- `date-fns` - Date formatting

## 🛠️ Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner in interactive watch mode

## 📱 Features by Role

### Patient Features
- ✅ Complete reminder management (CRUD)
- ✅ Medical document upload with AI analysis
- ✅ AI health chat assistant
- ✅ Blood pressure tracking
- ✅ Blood sugar tracking
- ✅ QR-based access control
- ✅ Pharmacy and medicine search

### Doctor Features
- ✅ Patient management dashboard
- ✅ Medical records access
- 📋 Appointment scheduling (UI ready)
- 📊 Analytics and reports (UI ready)

### Pharmacy Features
- ✅ Medicine inventory management
- ✅ Stock tracking and updates
- 📦 Order management (UI ready)
- 📊 Sales reports (UI ready)

## 🔐 Authentication Flow

1. **Landing Page**: Choose user type (Patient/Doctor/Pharmacy)
2. **Login/Register**: Role-specific authentication
3. **Dashboard**: Redirects to appropriate role dashboard
4. **Protected Routes**: All dashboard routes require authentication

## 🌐 API Integration

All API calls are handled through:
- `src/services/api.js` - Axios instance with interceptors
- `src/services/apiService.js` - Specific API endpoint functions

Features:
- Automatic token injection
- Request/response interceptors
- Error handling
- Auto-redirect on 401 (unauthorized)

## 🔄 Real-Time Notifications

Socket.IO integration provides:
- Instant reminder notifications
- Live status updates
- Real-time chat messages
- Connection status monitoring

## 🎯 Next Steps & Enhancements

### Planned Features
- [ ] Push notifications
- [ ] Offline support with service workers
- [ ] Advanced analytics dashboards
- [ ] Appointment calendar view
- [ ] Video consultation integration
- [ ] Prescription management
- [ ] Insurance integration

### Performance Optimizations
- [ ] Code splitting
- [ ] Lazy loading routes
- [ ] Image optimization
- [ ] Caching strategies

## 🐛 Troubleshooting

### Common Issues

**1. Cannot connect to backend**
- Ensure backend is running on `http://localhost:5000`
- Check CORS settings in backend

**2. Socket.IO not connecting**
- Verify backend Socket.IO server is initialized
- Check console for connection errors

**3. Theme not persisting**
- Clear browser localStorage if needed
- Check browser console for errors

**4. Authentication issues**
- Clear localStorage and try logging in again
- Verify JWT token is being sent in requests

## 📞 Support

For issues or questions:
1. Check backend README for API documentation
2. Verify backend server is running
3. Check browser console for errors
4. Review network tab for failed requests

## 🎉 Credits

Built with ❤️ using:
- React 18
- Modern CSS with CSS Variables
- Socket.IO for real-time features
- Axios for API communication

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 2025

**Happy Coding! 🚀**
