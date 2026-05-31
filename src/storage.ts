import type { StorageSchema } from './types.js'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

const DEFAULT_SCHEMA: StorageSchema = {
    lastResinAmount: 0,
    lastTimestamp: 0,
}

export class Storage {
    public filePath: string

    public constructor(private extUUID: string) {
        this.filePath = this.getFilePath()
    }

    public saveAll(schema: StorageSchema) {
        const bytes = new TextEncoder().encode(JSON.stringify(schema))
        const file = Gio.File.new_for_path(this.filePath)

        const parent = file.get_parent()

        if (parent && !parent.query_exists(null)) {
            parent.make_directory_with_parents(null)
        }

        file.replace_contents(
            bytes,
            null,
            false,
            Gio.FileCreateFlags.REPLACE_DESTINATION,
            null,
        )
    }

    public async getAll(): Promise<StorageSchema> {
        const file = Gio.File.new_for_path(this.getFilePath())

        try {
            const [contents, _] = await file.load_contents_async(null)

            if (!contents) {
                console.error('Getting data from storage is not successful')
                return DEFAULT_SCHEMA
            }

            const data = JSON.parse(new TextDecoder().decode(contents))

            return {
                lastResinAmount: data.lastResinAmount,
                lastTimestamp: data.lastTimestamp,
            }
        } catch (e) {
            console.error('Error getting data from storage: ', e)
            return DEFAULT_SCHEMA
        }
    }

    private getFilePath(): string {
        const dataDir = GLib.get_user_data_dir() // ~/.local/share/
        const extensionDir = `${dataDir}/${this.extUUID}`

        return `${extensionDir}/storage.json`
    }
}
