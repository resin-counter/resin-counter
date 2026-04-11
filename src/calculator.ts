import { MAX_RESIN } from './extension.js'

export class Calculator {
    public constructor(private resinEveryMin: number) {}

    public calculateCurrentResin(lastResinAmount: number, lastTimestamp: number): number {
        const timeDiff = Date.now() - lastTimestamp

        if (timeDiff < 0) {
            return 0
        }

        const resinToAdd = Math.floor(timeDiff / (this.resinEveryMin * 60 * 1000))
        const currentResin = lastResinAmount + resinToAdd

        return currentResin > MAX_RESIN ? MAX_RESIN : currentResin
    }
}
