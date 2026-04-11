import type { ReplenishTimestamps } from './types.js'

import St from 'gi://St'
import Clutter from 'gi://Clutter'

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js'

export class Popup {
    // Entry (input) where you enter your resin amount in popup menu
    private entry?: St.Entry
    private fullReplenish?: St.Label
    private fullReplenishAt?: St.Label
    private nextReplenish?: St.Label

    private popup: PopupMenu.PopupMenu

    public constructor(
        private button: PanelMenu.Button,
        private onInputSubmit: (value: number) => void,
    ) {
        this.popup = this.draw()
    }

    public draw(): PopupMenu.PopupMenu {
        const popup = new PopupMenu.PopupMenu(this.button, 0.5, St.Side.TOP)

        popup.addMenuItem(this.drawInputLabel())
        popup.addMenuItem(this.drawInputEntry())

        this.nextReplenish = this.addCountdownItem(popup, 'Replenished in')
        this.fullReplenish = this.addCountdownItem(popup, 'Fully replenished in')
        this.fullReplenishAt = this.addCountdownItem(popup, 'Replenishment ends at')

        this.button.setMenu(popup)

        return popup
    }

    public close(): void {
        this.popup.close()
    }

    public destroy(): void {
        this.popup?.destroy()
        this.entry?.destroy()
    }

    public updateTimers(data: ReplenishTimestamps): void {
        if (!this.nextReplenish || !this.fullReplenish || !this.fullReplenishAt) {
            return
        }

        this.nextReplenish.text = this.formatCountdown(data.next)
        this.fullReplenish.text = this.formatCountdown(data.full)
        this.fullReplenishAt.text = this.calculateReplenishAt(data.full)
    }

    private addCountdownItem(popup: PopupMenu.PopupMenu, text: string): St.Label {
        const box = new St.BoxLayout({ vertical: true, reactive: false })

        box.add_child(
            new St.Label({
                text,
                x_align: Clutter.ActorAlign.START,
                style_class: 'grc-replunish__label',
            }),
        )

        const label = new St.Label({
            text: '00:00:00',
            x_align: Clutter.ActorAlign.START,
            style_class: 'grc-replunish__timer',
        })

        box.add_child(label)

        const menuItem = new PopupMenu.PopupBaseMenuItem({ reactive: false })
        menuItem.add_child(box)

        popup.addMenuItem(menuItem)

        return label
    }

    private calculateReplenishAt(timestamp: number): string {
        if (timestamp <= 0) {
            return 'Already full'
        }

        const targetDate = new Date(timestamp)
        const now = new Date()

        // Reset time parts to compare just the dates
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const targetDay = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
        )

        // Format time as HH:MM
        const hours = targetDate.getHours().toString().padStart(2, '0')
        const minutes = targetDate.getMinutes().toString().padStart(2, '0')
        const timeStr = `${hours}:${minutes}`

        if (targetDay.getTime() === today.getTime()) {
            return `Today ${timeStr}`
        }

        if (targetDay.getTime() === tomorrow.getTime()) {
            return `Tomorrow ${timeStr}`
        }

        const month = (targetDate.getMonth() + 1).toString().padStart(2, '0')
        const day = targetDate.getDate().toString().padStart(2, '0')

        return `${month}/${day} ${timeStr}`
    }

    private formatCountdown(timestampMs: number): string {
        const now = Date.now()
        const diffMs = timestampMs - now

        // If the timestamp is in the past, return "00:00:00"
        if (diffMs <= 0) {
            return '00:00:00'
        }

        const totalSeconds = Math.floor(diffMs / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        // Pad with leading zeros
        const pad = (num: number): string => num.toString().padStart(2, '0')

        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }

    private drawInputLabel(): PopupMenu.PopupBaseMenuItem {
        const labelItem = new PopupMenu.PopupBaseMenuItem({ reactive: false })

        labelItem.add_child(
            new St.Label({
                text: 'Enter your current resin\namount in the field below\nand press Enter.',
                x_align: Clutter.ActorAlign.START,
                style_class: 'grc-input__label',
            }),
        )

        return labelItem
    }

    private drawInputEntry(): PopupMenu.PopupBaseMenuItem {
        const menuItem = new PopupMenu.PopupBaseMenuItem({ reactive: false })

        this.entry = new St.Entry({
            hint_text: 'Your current resin',
            track_hover: false,
            can_focus: true,
        })

        menuItem.add_child(this.entry)

        this.entry.get_text()
        this.entry.set_width(200)

        this.entry.clutter_text.connect('activate', () => {
            this.onInputSubmit(parseInt(this.entry!.get_text(), 10))
        })

        return menuItem
    }
}
