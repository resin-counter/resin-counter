import St from 'gi://St'
import Clutter from 'gi://Clutter'
import GLib from 'gi://GLib'
import Gio from 'gi://Gio'

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'

const APP_NAME = 'Genshin Resin Counter'
const RESIN_EVERY_MIN = 8

export default class ExampleExtension extends Extension {
    private buttonText: St.Label | null = null
    private indicator: PanelMenu.Button | null = null
    private interval: GLib.Source | null = null
    private resin: number = 0

    public enable(): void {
        this.indicator = this.createBtn()

        this.updateBtnText()

        this.interval = setInterval(
            this.updateCounter.bind(this),
            60000,
            // RESIN_EVERY_MIN * 60 * 1000,
        )

        Main.panel.addToStatusArea(this.uuid, this.indicator)
    }

    public disable(): void {
        this.indicator?.destroy()
        this.interval?.destroy()

        this.indicator = null
        this.interval = null
        this.resin = 0
    }

    private updateCounter(): void {
        this.resin += 1
        this.updateBtnText()
    }

    private createBtn(): PanelMenu.Button {
        const btn = new PanelMenu.Button(0.0, this.metadata.name, false)

        this.buttonText = this.getNewButtonText()

        const box = new St.BoxLayout()

        box.add_child(this.getButtonIcon())
        box.add_child(this.buttonText)

        btn.add_child(box)

        return btn
    }

    private getButtonIcon(): St.Icon {
        return new St.Icon({
            gicon: Gio.icon_new_for_string(`${this.path}/assets/resin.png`),
            style_class: 'system-status-icon',
        })
    }

    private updateBtnText(): void {
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

    private notify(msg: string): void {
        Main.notify(APP_NAME, msg)
    }
}
