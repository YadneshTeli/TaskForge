import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, CheckCheck, Trash2, Loader2, Inbox } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'

/* global process */
const API_BASE_URL = process.env.VITE_API_URL || 'http://10.72.125.97:4000/api'

export default function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, read

  useEffect(() => {
    loadNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(response.data.notifications || [])
    } catch {
      console.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_BASE_URL}/notifications/${id}/seen`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, seen: true } : notif))
      )
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive'
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setNotifications((prev) => prev.map((notif) => ({ ...notif, seen: true })))
      toast({
        title: 'Success',
        description: 'All notifications marked as read.'
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to mark all as read.',
        variant: 'destructive'
      })
    }
  }

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
      toast({
        title: 'Deleted',
        description: 'Notification deleted successfully.'
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive'
      })
    }
  }

  const groupNotificationsByDate = (notifs) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const groups = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: []
    }

    notifs.forEach((notif) => {
      const notifDate = new Date(notif.createdAt)
      notifDate.setHours(0, 0, 0, 0)

      if (notifDate.getTime() === today.getTime()) {
        groups.Today.push(notif)
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notif)
      } else if (notifDate >= lastWeek) {
        groups['This Week'].push(notif)
      } else {
        groups.Older.push(notif)
      }
    })

    return groups
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.seen
    if (filter === 'read') return notif.seen
    return true
  })

  const groupedNotifications = groupNotificationsByDate(filteredNotifications)
  const unreadCount = notifications.filter((n) => !n.seen).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  {filter === 'unread'
                    ? 'No unread notifications'
                    : filter === 'read'
                    ? 'No read notifications'
                    : 'No notifications yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedNotifications).map(
              ([group, notifs]) =>
                notifs.length > 0 && (
                  <div key={group}>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">{group}</h3>
                    <div className="space-y-2">
                      {notifs.map((notification) => (
                        <Card
                          key={notification.id}
                          className={`hover:shadow-md transition-shadow cursor-pointer ${
                            !notification.seen ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => !notification.seen && markAsRead(notification.id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <Bell className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <CardTitle className="text-base">
                                    {notification.title || 'Notification'}
                                  </CardTitle>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {!notification.seen && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      markAsRead(notification.id)
                                    }}
                                  >
                                    <CheckCheck className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
