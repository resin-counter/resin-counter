import type { ReplenishTimestamps, StorageSchema } from './types.js'

import St from 'gi://St'
import Clutter from 'gi://Clutter'
import GLib from 'gi://GLib'
import Gio from 'gi://Gio'

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'

import { Popup } from './popup.js'
import { Storage } from './storage.js'
import { Calculator } from './calculator.js'

export const APP_NAME = 'Genshin Resin Counter'
//export const RESIN_EVERY_MIN = 8
export const RESIN_EVERY_MIN = 1
export const MAX_RESIN = 200
export const RESIN_INTERVAL_MS = RESIN_EVERY_MIN * 60 * 1000

function notify(msg: string): void {
    Main.notify(APP_NAME, msg)
}

export default class ExampleExtension extends Extension {
    private resin: number = 0
    private popup?: Popup
    private storage?: Storage
    private storageSchema?: StorageSchema
    private calculator?: Calculator

    // Main button text where your resin and icon is displayed. We update
    // this field every x amount of minutes.
    private buttonText: St.Label | null = null

    // Main button with icon and resin counter in the top bar
    private button: PanelMenu.Button | null = null

    // Interval after which resin will be recalculated
    private interval: GLib.Source | null = null

    public enable(): void {
        this.calculator = new Calculator(RESIN_EVERY_MIN)
        this.storage = new Storage(this.metadata.uuid)
        this.button = this.drawButton()
        this.storageSchema = this.storage!.getAll()
        this.popup = new Popup(this.button, this.tryToSubmitResin.bind(this))

        this.resin = this.calculateCurrentResin()
        this.redrawDisplayedResin()

        Main.panel.addToStatusArea(this.uuid, this.button)

        this.interval = setInterval(() => {
            this.updateResinNumber()
            this.updateTimers()
        }, 1000)
    }

    public disable(): void {
        this.button?.destroy()
        this.interval?.destroy()

        this.button = null
        this.interval = null
        this.resin = 0
    }

    private updateResinNumber(): void {
        const newResin = this.calculateCurrentResin()

        if (newResin === this.resin) {
            return
        }

        this.resin = newResin
        this.redrawDisplayedResin()
    }

    private updateTimers(): void {
        const data: ReplenishTimestamps = { full: 0, next: 0 }

        const now = Date.now()
        const lastTimestamp = this.storageSchema!.lastTimestamp
        const lastResinAmount = this.storageSchema!.lastResinAmount

        const minutesPassed = (now - lastTimestamp) / (1000 * 60)
        const resinGained = Math.floor(minutesPassed / RESIN_EVERY_MIN)
        const currentResin = Math.min(lastResinAmount + resinGained, MAX_RESIN)

        // If already capped, just update once and stop the interval
        if (currentResin >= MAX_RESIN) {
            data.full = 0
            data.next = 0
            this.popup!.updateTimers(data)
            return
        }

        const lastIncrementTimestamp = lastTimestamp + resinGained * RESIN_INTERVAL_MS
        data.next = lastIncrementTimestamp + RESIN_INTERVAL_MS

        const resinNeeded = MAX_RESIN - currentResin
        data.full = lastIncrementTimestamp + resinNeeded * RESIN_INTERVAL_MS

        this.popup!.updateTimers(data)
    }

    private calculateCurrentResin(): number {
        return this.calculator!.calculateCurrentResin(
            this.storageSchema!.lastResinAmount,
            this.storageSchema!.lastTimestamp,
        )
    }

    private drawButton(): PanelMenu.Button {
        const button = new PanelMenu.Button(0.0, this.metadata.name, true)

        this.buttonText = this.getNewButtonText()

        const box = new St.BoxLayout()

        box.add_child(this.getButtonIcon())
        box.add_child(this.buttonText)

        button.add_child(box)

        return button
    }

    private getButtonIcon(): St.Icon {
        return new St.Icon({
            gicon: Gio.icon_new_for_string(`${this.path}/assets/resin.png`),
            style_class: 'system-status-icon',
        })
    }

    private redrawDisplayedResin(): void {
        if (!this.buttonText) {
            this.buttonText = this.getNewButtonText()
        }

        this.buttonText.text = this.resin.toString()
    }

    private getNewButtonText(): St.Label {
        const buttonText = new St.Label({
            text: this.resin.toString(),
            y_align: Clutter.ActorAlign.CENTER,
        })

        buttonText.set_style('text-align:center;')

        return buttonText
    }

    private tryToSubmitResin(value: number): void {
        if (isNaN(value) || value < 0 || value > MAX_RESIN) {
            notify(`Please enter a number between 0 and ${MAX_RESIN}`)
            return
        }

        this.storage!.saveAll({
            lastResinAmount: value,
            lastTimestamp: Date.now(),
        })

        this.resin = value
        this.storageSchema = this.storage!.getAll()
        this.redrawDisplayedResin()
        this.popup!.close()
    }
}
