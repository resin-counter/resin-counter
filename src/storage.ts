import type { StorageSchema } from './types.js'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

export class Storage {
    public filePath: string

    public constructor() {
        this.filePath = this.getFilePath()
    }

    public saveResin(resin: number) {
        this.save({ resin, timestamp: Date.now() / 1000 })
    }

    private save(value: StorageSchema) {
        const bytes = new TextEncoder().encode(JSON.stringify(value))
        const file = Gio.File.new_for_path(this.filePath)

        file.replace_contents(
            bytes,
            null,
            false,
            Gio.FileCreateFlags.REPLACE_DESTINATION,
            null,
        )
    }

    private getFilePath(): string {
        const dataDir = GLib.get_user_data_dir() // ~/.local/share/
        const extensionDir = `${dataDir}/genshin-resin-counter`

        return `${extensionDir}/storage.json`
    }
}
