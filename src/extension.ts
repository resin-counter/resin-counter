import St from 'gi://St'
import Clutter from 'gi://Clutter'
import GLib from 'gi://GLib'

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

    public enable() {
        this.indicator = this.createBtn()

        this.updateResinIfNeeded()

        this.interval = setInterval(
            this.updateResinIfNeeded,
            RESIN_EVERY_MIN * 60 * 1000,
        )

        Main.panel.addToStatusArea(this.uuid, this.indicator)
    }

    public disable() {
        this.indicator?.destroy()
        this.interval?.destroy()

        this.indicator = null
        this.interval = null
    }

    private updateResinIfNeeded(): void {
        this.resin = this.resin + 1
        this.updateBtnText()
    }

    private createBtn(): PanelMenu.Button {
        const button = new PanelMenu.Button(0.0, this.metadata.name, false)

        this.buttonText = this.getNewButtonText()

        button.add_child(this.buttonText)

        return button
    }

    private getBtnText(): string {
        return `${this.resin}/200`
    }

    private updateBtnText(): void {
        if (!this.buttonText) {
            this.buttonText = this.getNewButtonText()
        }

        this.buttonText.text = this.getBtnText()
    }

    private getNewButtonText(): St.Label {
        const buttonText = new St.Label({
            text: this.getBtnText(),
            y_align: Clutter.ActorAlign.CENTER,
        })

        buttonText.set_style('text-align:center;')

        return buttonText
    }

    private notify(msg: string): void {
        Main.notify(APP_NAME, msg)
    }
}
