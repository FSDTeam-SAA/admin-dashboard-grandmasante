"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { io, type Socket } from "socket.io-client"
import { Send, MessageCircle, Phone, Mail, MapPin, UserRound } from "lucide-react"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ChatUser = {
  _id: string
  name?: string
  email?: string
  phone?: string
  country?: string
  gender?: string
  role?: string
  currentPlan?: string
  credit?: number
  avatar?: {
    url?: string
  }
}

type ChatMessage = {
  _id: string
  conversationId: string
  sender: ChatUser
  receiver: ChatUser
  content: string
  contentType: string
  createdAt: string
  isMe: boolean
}

type ChatPreview = {
  conversationId: string
  user: ChatUser
  lastMessage: ChatMessage
  isMe: boolean
}

const socketBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/api\/v1\/?$/, "")

export default function FollowupPage() {
  const { data: session } = useSession()
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [reply, setReply] = useState("")
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const selectedUserId = selectedUser?._id

  const addMessage = useCallback((incoming: ChatMessage) => {
    setMessages((current) => {
      if (current.some((message) => message._id === incoming._id)) return current
      return [...current, incoming].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    })
  }, [])

  const fetchChats = useCallback(async () => {
    setIsLoadingChats(true)
    try {
      const response = await apiClient.get("/messages/admin/chats")
      const nextChats = response.data.data ?? []
      setChats(nextChats)
      setSelectedUser((current) => current ?? nextChats[0]?.user ?? null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load followup chats")
    } finally {
      setIsLoadingChats(false)
    }
  }, [])

  const fetchMessages = useCallback(async (userId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await apiClient.get(`/messages/${userId}/messages`)
      setMessages(response.data.data ?? [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load messages")
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId)
    }
  }, [fetchMessages, selectedUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!session?.accessToken || !socketBaseUrl) return

    const socket: Socket = io(socketBaseUrl, {
      transports: ["websocket"],
      auth: { token: session.accessToken },
    })

    socket.on("newMessage", (message: ChatMessage) => {
      const otherUserId = message.sender?.role === "admin" ? message.receiver?._id : message.sender?._id
      if (otherUserId && selectedUserId === otherUserId) addMessage(message)
      fetchChats()
    })

    socket.on("messageSent", (message: ChatMessage) => {
      const otherUserId = message.receiver?._id
      if (otherUserId && selectedUserId === otherUserId) addMessage(message)
      fetchChats()
    })

    socket.on("chatUpdated", fetchChats)
    socket.on("connect_error", () => toast.error("Live followup connection failed"))

    return () => {
      socket.disconnect()
    }
  }, [addMessage, fetchChats, selectedUserId, session?.accessToken])

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.user?._id === selectedUserId),
    [chats, selectedUserId]
  )

  const sendReply = async () => {
    const content = reply.trim()
    if (!selectedUserId || !content || isSending) return

    setIsSending(true)
    setReply("")

    try {
      const response = await apiClient.post("/messages/send", {
        receiverId: selectedUserId,
        content,
        contentType: "text",
      })
      addMessage(response.data.data)
      fetchChats()
    } catch (error: any) {
      setReply(content)
      toast.error(error?.response?.data?.message || "Failed to send reply")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="h-[calc(100vh-112px)] py-6">
      <div className="grid h-full grid-cols-[340px_minmax(0,1fr)_300px] overflow-hidden rounded-2xl border border-white/60 bg-white/75 shadow-sm backdrop-blur">
        <aside className="border-r border-slate-100 bg-white/80">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <MessageCircle className="h-5 w-5 text-[#5048E7]" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Regular Followup</h1>
              <p className="text-sm text-slate-500">{chats.length} conversations</p>
            </div>
          </div>

          <div className="h-[calc(100%-73px)] overflow-y-auto">
            {isLoadingChats && chats.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">Loading chats...</div>
            ) : chats.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No followup messages yet.</div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.conversationId}
                  onClick={() => setSelectedUser(chat.user)}
                  className={cn(
                    "flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-indigo-50/70",
                    selectedUserId === chat.user?._id && "bg-indigo-50"
                  )}
                >
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={chat.user?.avatar?.url || ""} />
                    <AvatarFallback>{initials(chat.user?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-slate-900">
                        {chat.user?.name || "Unnamed user"}
                      </p>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatTime(chat.lastMessage?.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {chat.isMe ? "You: " : ""}
                      {chat.lastMessage?.content || "Attachment"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col bg-[#F8FAFC]">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <p className="text-base font-semibold text-slate-900">
              {selectedUser?.name || "Select a conversation"}
            </p>
            <p className="text-sm text-slate-500">{selectedUser?.email || "Reply to users from here"}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isLoadingMessages ? (
              <div className="text-sm text-slate-500">Loading messages...</div>
            ) : !selectedUser ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Choose a user to open the followup conversation.
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No messages in this conversation yet.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={cn("flex", message.isMe ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[68%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                        message.isMe
                          ? "bg-[#5048E7] text-white"
                          : "border border-slate-100 bg-white text-slate-700"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={cn(
                          "mt-2 text-xs",
                          message.isMe ? "text-indigo-100" : "text-slate-400"
                        )}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-white p-4">
            <div className="flex items-end gap-3">
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    sendReply()
                  }
                }}
                disabled={!selectedUser || isSending}
                placeholder="Type your reply..."
                className="min-h-12 resize-none border-slate-200 bg-white"
              />
              <Button
                onClick={sendReply}
                disabled={!selectedUser || !reply.trim() || isSending}
                className="h-12 gap-2 bg-[#5048E7] px-5 hover:bg-[#4038c9]"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </section>

        <aside className="border-l border-slate-100 bg-white/90 p-5">
          <h2 className="text-base font-semibold text-slate-900">User Information</h2>
          {selectedUser ? (
            <div className="mt-5 space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={selectedUser.avatar?.url || ""} />
                  <AvatarFallback>{initials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {selectedUser.name || "Unnamed user"}
                  </p>
                  <Badge className="mt-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    {selectedUser.role || "user"}
                  </Badge>
                </div>
              </div>

              <InfoRow icon={Mail} label={selectedUser.email || "No email"} />
              <InfoRow icon={Phone} label={selectedUser.phone || "No phone"} />
              <InfoRow icon={MapPin} label={selectedUser.country || "No country"} />
              <InfoRow icon={UserRound} label={selectedUser.gender || "Gender not set"} />

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Plan</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedUser.currentPlan || "No active plan"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Credit</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedUser.credit ?? 0}
                </p>
              </div>
              {selectedChat?.lastMessage && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Last message
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(selectedChat.lastMessage.createdAt)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Select a chat to see user details.</p>
          )}
        </aside>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <Icon className="h-4 w-4 text-slate-400" />
      <span className="min-w-0 truncate">{label}</span>
    </div>
  )
}

function initials(name?: string) {
  if (!name) return "GS"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatTime(value?: string) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatDate(value?: string) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}
