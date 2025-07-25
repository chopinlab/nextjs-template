'use client'

import { useEffect } from 'react'
import { useNotifications } from '@/lib/store'

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotifications()

  useEffect(() => {
    // 5초 후 자동 제거
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id)
      }, 5000)
      
      return () => clearTimeout(timer)
    })
  }, [notifications, removeNotification])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg min-w-72 max-w-md ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-lg opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}