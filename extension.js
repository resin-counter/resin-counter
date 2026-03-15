import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
const APP_NAME = 'Genshin Resin Counter';
export default class ExampleExtension extends Extension {
    buttonText = null;
    indicator = null;
    resin = 0;
    enable() {
        this.indicator = this.createBtn();
        setInterval(() => {
            this.resin = this.resin + 1;
            this.updateBtnText();
        }, 1000);
        Main.panel.addToStatusArea(this.uuid, this.indicator);
    }
    disable() {
        this.indicator?.destroy();
        this.indicator = null;
    }
    createBtn() {
        const button = new PanelMenu.Button(0.0, this.metadata.name, false);
        this.buttonText = this.getNewButtonText();
        button.add_child(this.buttonText);
        return button;
    }
    getBtnText() {
        return `${this.resin}/200`;
    }
    updateBtnText() {
        if (!this.buttonText) {
            this.buttonText = this.getNewButtonText();
        }
        this.buttonText.text = this.getBtnText();
    }
    getNewButtonText() {
        const buttonText = new St.Label({
            text: this.getBtnText(),
            y_align: Clutter.ActorAlign.CENTER,
        });
        buttonText.set_style('text-align:center;');
        return buttonText;
    }
    notify(msg) {
        Main.notify(APP_NAME, msg);
    }
}
