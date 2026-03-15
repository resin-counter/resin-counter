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

        popup.addMenuItem(this.drawLabelMenuItem())
        popup.addMenuItem(this.drawEntryMenuItem())

        this.button.setMenu(popup)

        return popup
    }

    public close(): void {
        this.popup.close()
    }

    private drawLabelMenuItem(): PopupMenu.PopupBaseMenuItem {
        const labelItem = new PopupMenu.PopupBaseMenuItem({ reactive: false })

        labelItem.add_child(
            new St.Label({
                text: 'Enter your current resin\namount in the field below\nand press Enter.',
                x_align: Clutter.ActorAlign.START,
            }),
        )

        return labelItem
    }

    private drawEntryMenuItem(): PopupMenu.PopupBaseMenuItem {
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
