import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { ExternalLink } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Separator } from '../../components/ui/separator'
import { useTheme, applyTheme, ThemeValue } from '../../utils/theme'
import { ButtonGroup } from '../../components/ui/button-group'
import optionsStorage from '../../utils/optionsStorage'
import '../../assets/globals.css'
import './options.css'

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

const OptionsPage: React.FC = () => {
  useTheme()
  const [opts, setOpts] = useState<Options>(DEFAULTS)

  useEffect(() => {
    optionsStorage.getAll().then(saved => {
      setOpts({ ...DEFAULTS, ...(saved as Partial<Options>) })
    })
  }, [])

  const set = <K extends keyof Options>(key: K, value: Options[K]) => {
    const next = { ...opts, [key]: value }
    setOpts(next)
    saveOptions(next)
  }

  const setSyncSetting = <K extends keyof Options>(key: K, value: Options[K]) => {
    set(key, value)
    browser.runtime.sendMessage({ name: 'settingChanged' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure BookmarkHub sync</p>
        </div>

        <Separator />

        {/* GitHub section */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="githubToken">{browser.i18n.getMessage('githubToken')}</Label>
            <div className="flex gap-2">
              <Input
                id="githubToken"
                type="text"
                placeholder="ghp_xxxxxxxxxxxx"
                value={opts.githubToken}
                onChange={e => set('githubToken', e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/settings/tokens/new" target="_blank" className="flex items-center gap-1.5">
                  Get Token <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gistID">{browser.i18n.getMessage('gistID')}</Label>
            <Input
              id="gistID"
              placeholder="a1b2c3d4e5f6..."
              value={opts.gistID}
              onChange={e => set('gistID', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gistFileName">{browser.i18n.getMessage('gistFileName')}</Label>
            <Input
              id="gistFileName"
              placeholder="BookmarkHub"
              value={opts.gistFileName}
              onChange={e => set('gistFileName', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Notifications + Auto Sync */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{browser.i18n.getMessage('enableNotifications')}</Label>
              <p className="text-xs text-muted-foreground">Show a notification after each sync</p>
            </div>
            <Switch
              checked={opts.enableNotify}
              onCheckedChange={v => set('enableNotify', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Sync</Label>
              <p className="text-xs text-muted-foreground">Upload on change · download when remote changes</p>
            </div>
            <Switch
              checked={opts.autoSync}
              onCheckedChange={v => setSyncSetting('autoSync', v)}
            />
          </div>

          {opts.autoSync && (
            <div className="space-y-1.5">
              <Label htmlFor="autoSyncInterval">Check interval (minutes)</Label>
              <Input
                id="autoSyncInterval"
                type="number"
                min="1"
                value={opts.autoSyncInterval}
                onChange={e => setSyncSetting('autoSyncInterval', Number(e.target.value) || 5)}
                className="w-24"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Theme */}
        <div className="flex items-center justify-between">
          <Label>Theme</Label>
          <ButtonGroup
            value={opts.theme}
            onChange={v => { set('theme', v); applyTheme(v) }}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light',  label: 'Light'  },
              { value: 'dark',   label: 'Dark'   },
              { value: 'black',  label: 'Black'  },
            ]}
          />
        </div>


        <Separator />

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          <a
            href="https://github.com/dudor/BookmarkHub"
            target="_blank"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            {browser.i18n.getMessage('help')}
          </a>
        </p>

      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>
)
