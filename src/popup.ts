import type { ReplenishTimestamps } from './types.js'

import St from 'gi://St'
import Clutter from 'gi://Clutter'

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js'

export class Popup {
    // Entry (input) where you enter your resin amount in popup menu
    private entry: St.Entry | null = null

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
        popup.addMenuItem(this.drawReplenished())
        popup.addMenuItem(this.drawFullyReplenished())

        this.button.setMenu(popup)

        return popup
    }

    public close(): void {
        this.popup.close()
    }

    public updateTimers(data: ReplenishTimestamps): void {
        log(`DEBUG: full(${this.formatCountdown(data.full)})`)
        log(`DEBUG: next(${this.formatCountdown(data.next)})`)
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

    private drawReplenished(): PopupMenu.PopupBaseMenuItem {
        const box = new St.BoxLayout({ vertical: true, reactive: false })

        box.add_child(
            new St.Label({
                text: 'Replenished in',
                x_align: Clutter.ActorAlign.START,
                style_class: 'grc-replunish__label',
            }),
        )

        box.add_child(
            new St.Label({
                text: '00:00:00',
                x_align: Clutter.ActorAlign.START,
                style_class: 'grc-replunish__timer',
            }),
        )

        const menuItem = new PopupMenu.PopupBaseMenuItem({ reactive: false })
        menuItem.add_child(box)

        return menuItem
    }

    private drawFullyReplenished(): PopupMenu.PopupBaseMenuItem {
        const box = new St.BoxLayout({ vertical: true, reactive: false })

        box.add_child(
            new St.Label({
                text: 'Fully replenished in',
                x_align: Clutter.ActorAlign.START,
                style_class: 'grc-replunish__label',
            }),
        )

        box.add_child(
            new St.Label({
                text: '00:00:00',
                x_align: Clutter.ActorAlign.START,
                style_class: 'grc-replunish__timer',
            }),
        )

        const menuItem = new PopupMenu.PopupBaseMenuItem({ reactive: false })
        menuItem.add_child(box)

        return menuItem
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
