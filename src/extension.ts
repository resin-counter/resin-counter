import St from 'gi://St'
import Clutter from 'gi://Clutter'
import GLib from 'gi://GLib'
import Gio from 'gi://Gio'

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'

import { Popup } from './popup.js'

const APP_NAME = 'Genshin Resin Counter'
const RESIN_EVERY_MIN = 8

function notify(msg: string): void {
    Main.notify(APP_NAME, msg)
}

export default class ExampleExtension extends Extension {
    private resin: number = 0
    private popup: Popup | null = null

    // Main button text where your resin and icon is displayed. We update
    // this field every x amount of minutes.
    private buttonText: St.Label | null = null

    // Main button with icon and resin counter in the top bar
    private button: PanelMenu.Button | null = null

    // Interval after which resin will be recalculated
    private interval: GLib.Source | null = null

    public enable(): void {
        this.button = this.drawButton()
        this.popup = new Popup(this.button, this.tryToSubmitResin.bind(this))

        this.redrawDisplayedResin()

        this.interval = setInterval(
            this.updateCounter.bind(this),
            RESIN_EVERY_MIN * 60 * 1000,
        )

        Main.panel.addToStatusArea(this.uuid, this.button)
    }

    public disable(): void {
        this.button?.destroy()
        this.interval?.destroy()

        this.button = null
        this.interval = null
        this.resin = 0
    }

    private updateCounter(): void {
        this.resin += 1
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
        if (isNaN(value) || value < 0 || value > 200) {
            notify('Please enter a number between 0 and 200')
            return
        }

        this.resin = value
        this.redrawDisplayedResin()

        this.popup!.close()
    }
}
