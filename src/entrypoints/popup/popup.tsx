import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {
  CloudUpload, CloudDownload, Trash2, Settings,
  HardDrive, Cloud, Github, Loader2, Bookmark,
} from 'lucide-react'
import { Separator } from '../../components/ui/separator'
import { useTheme } from '../../utils/theme'
import '../../assets/globals.css'
import './popup.css'

type Action = 'upload' | 'download' | 'removeAll' | 'setting' | null

const Popup: React.FC = () => {
  useTheme()
  const [count, setCount] = useState({ local: '–', remote: '–' })
  const [loading, setLoading] = useState<Action>(null)

  useEffect(() => {
    browser.storage.local.get(['localCount', 'remoteCount']).then(data => {
      setCount({
        local: data['localCount'] ?? '–',
        remote: data['remoteCount'] ?? '–',
      })
    })
  }, [])

  const send = (name: Action) => {
    if (loading || !name) return
    setLoading(name)
    browser.runtime.sendMessage({ name }).finally(() => setLoading(null))
  }

  const menuBtn = (
    label: string,
    icon: React.ReactNode,
    action: Action,
    destructive = false
  ) => (
    <button
      onClick={() => send(action)}
      disabled={!!loading}
      title={browser.i18n.getMessage(`${action}BookmarksDesc`) || undefined}
      className={[
        'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
        'disabled:opacity-40',
        destructive
          ? 'text-destructive hover:bg-accent'
          : 'hover:bg-accent hover:text-accent-foreground',
      ].join(' ')}
    >
      {loading === action
        ? <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        : <span className="h-4 w-4 shrink-0">{icon}</span>}
      {label}
    </button>
  )

  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Bookmark className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold tracking-tight">BookmarkHub</span>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex flex-col py-1">
        {menuBtn(browser.i18n.getMessage('uploadBookmarks'),   <CloudUpload className="h-4 w-4" />,  'upload')}
        {menuBtn(browser.i18n.getMessage('downloadBookmarks'), <CloudDownload className="h-4 w-4" />, 'download')}
        {menuBtn(browser.i18n.getMessage('removeAllBookmarks'), <Trash2 className="h-4 w-4" />,      'removeAll', true)}
      </div>

      <Separator />

      {/* Settings */}
      <div className="py-1">
        <button
          onClick={() => send('setting')}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {browser.i18n.getMessage('settings')}
        </button>
      </div>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1" title={browser.i18n.getMessage('localCount')}>
            <HardDrive className="h-3 w-3" />{count.local}
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1" title={browser.i18n.getMessage('remoteCount')}>
            <Cloud className="h-3 w-3" />{count.remote}
          </span>
        </div>
        <a
          href="https://github.com/dudor/BookmarkHub"
          target="_blank"
          title={browser.i18n.getMessage('help')}
          className="hover:text-foreground transition-colors"
        >
          <Github className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
)
