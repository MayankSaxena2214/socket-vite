import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:3000/api/v1'
import { io } from 'socket.io-client'
const formatDate = (value) => {
  if (!value) return 'Recently'

  const date = new Date(value)
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const Tickets = () => {
  const navigate = useNavigate()
  const chatEndRef = useRef(null)
  const socketRef = useRef(null)
  const role = localStorage.getItem('userRole') || 'customer'
  const storedToken = localStorage.getItem('accessToken') || ''

  const [tickets, setTickets] = useState([])
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [messages, setMessages] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [error, setError] = useState('')

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId],
  )

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoadingTickets(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/tickets`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${storedToken}`,
  },
});

        const payload = await response.json()

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || 'Failed to load tickets.')
        }

        const items = Array.isArray(payload.items) ? payload.items : []
        setTickets(items)

        // if (items.length > 0 && !selectedTicketId) {
        //   setSelectedTicketId(items[0].id)
        // }
      } catch (loadError) {
        setError(loadError.message || 'Unable to load tickets.')
      } finally {
        setLoadingTickets(false)
      }
    }

    if (storedToken) {
      fetchTickets()
    } else {
      navigate('/user-login')
    }
  }, [navigate, selectedTicketId, storedToken])

  useEffect(() => {
    if (!selectedTicketId) return

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true)
        const response = await fetch(`${API_BASE_URL}/tickets/${selectedTicketId}/messages`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        })

        const payload = await response.json()

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || 'Failed to load ticket messages.')
        }

        const ticketMessages = payload?.ticket?.messages || []
        setMessages(ticketMessages)
      } catch (messageError) {
        setError(messageError.message || 'Failed to load messages.')
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [selectedTicketId, storedToken])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedTicketId])

  useEffect(() => {
  const socket = io('http://localhost:3000', {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  })

  socketRef.current = socket

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message)
  })

   // Listen for real-time ticket messages
  socket.on('ticket:new-message', (message) => {
    console.log('New real-time message received:', message);
    setMessages((prev)=>{
        return [
            ...prev,
            message
        ]
    });
  })

  return () => {
    socket.disconnect()
  }
}, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('tokenType')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('user')
    navigate('/user-login')
  }

  const handleSendMessage = async () => {
    if (!selectedTicketId || !replyText.trim()) return

    const messageText = replyText.trim()
    const requestBody = {
      text: messageText,
      attachments: [],
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${selectedTicketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Unable to send message.')
      }

      setReplyText('')
    } catch (sendError) {
      setError(sendError.message || 'Failed to send message.')
    }
  }

  const handleTicketClick=(ticket)=>{
    setSelectedTicketId(ticket.id);
    socketRef.current.emit('ticket:join',{
        ticketId:ticket.id
    });

  }

  return (
    <div className="min-h-screen bg-slate-950 px-3 py-6 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">Protected</p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">Tickets</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium capitalize text-slate-200">
              {role}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-violet-500 hover:text-violet-300"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid h-[75vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/30 md:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="border-b border-slate-800 bg-slate-950/40 md:border-b-0 md:border-r">
            <div className="border-b border-slate-800 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">All tickets</h2>
            </div>

            <div className="max-h-[calc(75vh-72px)] overflow-y-auto">
              {loadingTickets ? (
                <div className="p-4 text-sm text-slate-400">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="p-4 text-sm text-slate-400">No tickets found.</div>
              ) : (
                tickets.map((ticket) => {
                  const isActive = ticket.id === selectedTicketId

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => handleTicketClick(ticket)}
                      className={`flex w-full flex-col border-b border-slate-800 px-4 py-4 text-left transition ${
                        isActive ? 'bg-violet-500/10' : 'bg-transparent hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-100">{ticket.ticketNumber}</span>
                        <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-200">
                          {ticket.status}
                        </span>
                      </div>

                      <p className="mt-2 text-base font-medium text-slate-100">{ticket.title}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-400">{ticket.description}</p>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{ticket.priority}</span>
                        <span>{formatDate(ticket.updatedAt)}</span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </aside>

          <main className="flex min-h-0 flex-col bg-slate-950/40">
            {!selectedTicket ? (
              <div className="flex h-full items-center justify-center p-6 text-center text-slate-400">
                Select a ticket to start the conversation.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{selectedTicket.ticketNumber}</p>
                    <h3 className="mt-1 text-lg font-semibold">{selectedTicket.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-200">
                      {selectedTicket.status}
                    </span>
                    <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-violet-300">
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {loadingMessages ? (
                    <div className="text-sm text-slate-400">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No messages yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isCurrentUser =
                          message?.sender?.id === localStorage.getItem('userId') ||
                          message?.createdByType === (role || 'USER')

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                isCurrentUser
                                  ? 'bg-violet-600 text-white'
                                  : 'border border-slate-700 bg-slate-800 text-slate-100'
                              }`}
                            >
                              <div className="mb-1 flex items-center justify-between gap-6 text-[11px] opacity-80">
                                <span className="font-medium">{message?.sender?.fullName || 'Support'}</span>
                                <span>{formatDate(message.createdAt)}</span>
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 bg-slate-900/90 p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-700/50"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className="rounded-xl bg-violet-500 px-5 py-3 font-medium text-white transition hover:bg-violet-400"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Tickets
