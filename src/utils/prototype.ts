export { }

declare global {
    interface Node {
        toElement(): HTMLElement
    }

    interface Date {
        toStr(fm: String): String
    }

    interface Number {
        zf(len: Number): String
    }
}

Node.prototype.toElement = function (): HTMLElement {
    return this as HTMLElement
}

Date.prototype.toStr = function (fm: String): String {
    var rv = fm;
    rv = rv.replace('yyyy', `${this.getFullYear()}`);
    rv = rv.replace('MM', `${(this.getMonth() + 1).zf(2)}`);
    rv = rv.replace('dd', `${this.getDate().zf(2)}`)
    rv = rv.replace('HH', `${this.getHours().zf(2)}`);
    rv = rv.replace('mm', `${this.getMinutes().zf(2)}`);
    rv = rv.replace('ss', `${this.getSeconds().zf(2)}`);
    rv = rv.replace('zzz', `${this.getMilliseconds().zf(3)}`);
    return rv;
}

Number.prototype.zf = function (len: number): String {
    const n = this as number;
    var m = n < 0;
    var rv = (m ? (n * -1) : this) + '';
    var dif = len - rv.length;
    var zero = '';
    if (dif > 0) {
        for (var i = 0; i < dif; i++) { zero += '0'; }
    }
    return (m ? '-' : '') + zero + rv;
}