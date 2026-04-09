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
export const RESIN_EVERY_MIN = 8
export const MAX_RESIN = 200

function notify(msg: string): void {
    Main.notify(APP_NAME, msg)
}

export default class ExampleExtension extends Extension {
    private resin: number = 0
    private popup?: Popup
    private storage?: Storage
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

        this.popup = new Popup(this.button, this.tryToSubmitResin.bind(this))

        this.updateCounter()

        this.interval = setInterval(this.updateCounter.bind(this), 1000 * 60)

        Main.panel.addToStatusArea(this.uuid, this.button)
    }

    public disable(): void {
        this.button?.destroy()
        this.interval?.destroy()

        this.button = null
        this.interval = null
        this.resin = 0
    }

    private recalculateCurrentResin(): void {
        const data = this.storage!.getAll()

        this.resin = this.calculator!.calculateCurrentResin(
            data.lastResinAmount,
            data.lastTimestamp,
        )
    }

    private updateCounter(): void {
        this.recalculateCurrentResin()
        this.redrawDisplayedResin()
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
        this.redrawDisplayedResin()
        this.popup!.close()
    }
}
