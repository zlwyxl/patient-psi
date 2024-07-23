'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { Message } from 'ai'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { StartSession } from './start-session'
import { Sidebar } from './sidebar'
import { DiagramList } from './diagram-list'
import { PatientProfile, initialProfile } from '@/app/api/data/patient-profiles'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()

  const [_, setNewChatId] = useLocalStorage('newChatId', id)
  const [isStarted, setIsStarted] = useState(false);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(initialProfile);


  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  const handleStartedChange = (isStarted: boolean) => {
    setIsStarted(isStarted);
  }

  const handleSetPatientProfile = (patientProfile: PatientProfile) => {
    setPatientProfile(patientProfile);
    console.log("profile");
    console.log(patientProfile);
  }


  return (
    <>
      <div
        className="group ml-[-14%] w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
        ref={scrollRef}
      >
        {messages.length ? (
          <>
            <div className={cn('pb-[200px] pt-4 md:pt-10', className)} ref={messagesRef}>
              <ChatList messages={messages} isShared={false} session={session} />
              <div className="h-px w-full" ref={visibilityRef} />
            </div>
            <ChatPanel
              id={id}
              input={input}
              setInput={setInput}
              isAtBottom={isAtBottom}
              scrollToBottom={scrollToBottom}
            />
          </>
        ) : (
          <>
            {!isStarted ? (
              <div className={cn('pb-[200px] pt-4 md:pt-10', className)} ref={messagesRef}>
                <StartSession
                  onStartedChange={handleStartedChange}
                  onSetPatientProfile={handleSetPatientProfile} />
              </div>
            ) : (
              <>
                <div className={cn('pb-[200px] pt-4 md:pt-10', className)} ref={messagesRef}>
                  <div className="mx-auto max-w-2xl px-4">
                    <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
                      <h1 className="text-xl font-semibold">
                        开始新对话
                      </h1>
                      <label className="leading-normal pt-4 text-lg font-semibold text-blue-600">
                       相关历史 {patientProfile.name}:
                      </label>
                      <p className="leading-normal pt-2 font-medium text-blue-600">
                        {patientProfile.history}
                      </p>
                      <p className="leading-normal pt-1 font-light text-black dark:text-white">
                        (相关的历史记录将在整个会议期间显示在右边的栏中)
                      </p>
                      <p className="leading-normal pt-4 font-medium text-black dark:text-white">
                        现在你可以开始和 <b>{patientProfile.name}</b>谈话了.
                        请在下面的文本框中。对<b>{patientProfile.name}</b>输入第一个问候语开始对话
                      </p>
                      <label className="block pt-1 leading-normal font-medium text-red-500">
                        <span className="font-bold">对话时间为10分钟。</span>
                      </label>
                    </div>
                  </div>
                </div>
                <ChatPanel
                  id={id}
                  input={input}
                  setInput={setInput}
                  isAtBottom={isAtBottom}
                  scrollToBottom={scrollToBottom}
                />
              </>)
            }
          </>
        )}
      </div >
      {
        messages.length ? (
          <Sidebar className="peer absolute inset-y-0 z-30 hidden translate-x-full right-0 border-l bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[400px] xl:w-[600px]">
            {/* @ts-ignore */}
            <DiagramList userId={session.user.id} chatId={id} />
          </Sidebar>) : (<></>)
      }
    </>
  );
}
