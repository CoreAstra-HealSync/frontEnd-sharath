import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('user-connect', user._id || user.id);
      });

      newSocket.on('connection-success', (data) => {
        console.log('Socket connection success:', data);
      });

      newSocket.on('reminder-notification', (reminder) => {
        console.log('Reminder notification:', reminder);
        setNotifications(prev => [reminder, ...prev]);
        toast.info(`Reminder: ${reminder.title}`, {
          autoClose: 5000,
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const acknowledgeReminder = (reminderId) => {
    if (socket && user) {
      socket.emit('reminder-acknowledged', {
        userId: user._id || user.id,
        reminderId,
      });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, acknowledgeReminder }}>
      {children}
    </SocketContext.Provider>
  );
};
