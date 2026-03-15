import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {
  CloudUpload, CloudDownload, Trash2, Settings, ArrowLeft, ExternalLink,
  HardDrive, Cloud, Github, Loader2, Bookmark,
} from 'lucide-react'
import { Separator } from '../../components/ui/separator'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { ButtonGroup } from '../../components/ui/button-group'
import { useTheme, applyTheme, ThemeValue } from '../../utils/theme'
import optionsStorage from '../../utils/optionsStorage'
import '../../assets/globals.css'
import './popup.css'

type Action = 'upload' | 'download' | 'removeAll' | null

interface Options {
  githubToken: string
  gistID: string
  gistFileName: string
  enableNotify: boolean
  autoSync: boolean
  autoSyncInterval: number
  theme: ThemeValue
}

const DEFAULTS: Options = {
  githubToken: '',
  gistID: '',
  gistFileName: 'BookmarkHub',
  enableNotify: true,
  autoSync: false,
  autoSyncInterval: 5,
  theme: 'system',
}

async function saveOptions(next: Options) {
  await optionsStorage.set(next)
}

const Popup: React.FC = () => {
  useTheme()
  const [view, setView] = useState<'main' | 'settings'>('main')
  const [count, setCount] = useState({ local: '–', remote: '–' })
  const [loading, setLoading] = useState<Action>(null)
  const [opts, setOpts] = useState<Options>(DEFAULTS)

  useEffect(() => {
    browser.storage.local.get(['localCount', 'remoteCount']).then(data => {
      setCount({
        local: data['localCount'] ?? '–',
        remote: data['remoteCount'] ?? '–',
      })
    })
  }, [])

  useEffect(() => {
    if (view === 'settings') {
      optionsStorage.getAll().then(saved => {
        setOpts({ ...DEFAULTS, ...(saved as Partial<Options>) })
      })
    }
  }, [view])

  const send = (name: Action) => {
    if (loading || !name) return
    setLoading(name)
    browser.runtime.sendMessage({ name }).finally(() => setLoading(null))
  }

  const set = <K extends keyof Options>(key: K, value: Options[K]) => {
    const next = { ...opts, [key]: value }
    setOpts(next)
    saveOptions(next)
  }

  const setSyncSetting = <K extends keyof Options>(key: K, value: Options[K]) => {
    set(key, value)
    browser.runtime.sendMessage({ name: 'settingChanged' })
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

  if (view === 'settings') {
    return (
      <div className="flex flex-col bg-background text-foreground">
        {/* Settings header */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            onClick={() => setView('main')}
            className="flex items-center justify-center rounded p-1 hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">Settings</span>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-4 py-3">
          {/* GitHub Token */}
          <div className="space-y-1">
            <Label htmlFor="githubToken" className="text-xs">{browser.i18n.getMessage('githubToken')}</Label>
            <div className="flex gap-1.5">
              <Input
                id="githubToken"
                type="text"
                placeholder="ghp_xxxxxxxxxxxx"
                value={opts.githubToken}
                onChange={e => set('githubToken', e.target.value)}
                className="flex-1 h-7 text-xs"
              />
              <Button variant="outline" size="sm" asChild className="h-7 px-2">
                <a href="https://github.com/settings/tokens/new" target="_blank" className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>

          {/* Gist ID */}
          <div className="space-y-1">
            <Label htmlFor="gistID" className="text-xs">{browser.i18n.getMessage('gistID')}</Label>
            <Input
              id="gistID"
              placeholder="a1b2c3d4e5f6..."
              value={opts.gistID}
              onChange={e => set('gistID', e.target.value)}
              className="h-7 text-xs"
            />
          </div>

          {/* Gist File Name */}
          <div className="space-y-1">
            <Label htmlFor="gistFileName" className="text-xs">{browser.i18n.getMessage('gistFileName')}</Label>
            <Input
              id="gistFileName"
              placeholder="BookmarkHub"
              value={opts.gistFileName}
              onChange={e => set('gistFileName', e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2.5 px-4 py-3">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">{browser.i18n.getMessage('enableNotifications')}</Label>
            <Switch
              checked={opts.enableNotify}
              onCheckedChange={v => set('enableNotify', v)}
            />
          </div>

          {/* Auto Sync */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">Auto Sync</Label>
            <Switch
              checked={opts.autoSync}
              onCheckedChange={v => setSyncSetting('autoSync', v)}
            />
          </div>

          {opts.autoSync && (
            <div className="flex items-center justify-between">
              <Label htmlFor="autoSyncInterval" className="text-xs">Interval (min)</Label>
              <Input
                id="autoSyncInterval"
                type="number"
                min="1"
                value={opts.autoSyncInterval}
                onChange={e => setSyncSetting('autoSyncInterval', Number(e.target.value) || 5)}
                className="w-16 h-7 text-xs"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Theme */}
        <div className="flex flex-col gap-1.5 px-4 py-3">
          <Label className="text-xs">Theme</Label>
          <ButtonGroup
            value={opts.theme}
            onChange={v => { set('theme', v); applyTheme(v) }}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light',  label: 'Light'  },
              { value: 'dark',   label: 'Dark'   },
              { value: 'black',  label: 'Black'  },
            ]}
            className="w-full"
          />
        </div>
      </div>
    )
  }

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
        {menuBtn(browser.i18n.getMessage('uploadBookmarks'),    <CloudUpload className="h-4 w-4" />,   'upload')}
        {menuBtn(browser.i18n.getMessage('downloadBookmarks'),  <CloudDownload className="h-4 w-4" />, 'download')}
        {menuBtn(browser.i18n.getMessage('removeAllBookmarks'), <Trash2 className="h-4 w-4" />,        'removeAll', true)}
      </div>

      <Separator />

      {/* Settings */}
      <div className="py-1">
        <button
          onClick={() => setView('settings')}
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
