export { }

declare global {
    interface Node {
        toElement(): HTMLElement
    }
}

Node.prototype.toElement = function (): HTMLElement {
    return this as HTMLElement
}