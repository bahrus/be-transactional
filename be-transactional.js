import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
import { mergeDeep } from 'trans-render/lib/mergeDeep.js';
const guid = 'dngmX6Rkq0SEOT4Iqu7fCQ==';
//const propSubscribers = new WeakMap<Element, {[key: string]: string}>();
export class BeTransactionalController {
    #target;
    async intro(proxy, target, beDecorProps) {
        this.#target = target;
        if (target.localName.includes('-')) {
            await customElements.whenDefined(target.localName);
        }
        const propPathMap = JSON.parse(proxy.getAttribute('is-' + beDecorProps.ifWantsToBe));
        for (const propKey in propPathMap) {
            const path = propPathMap[propKey];
            this.hookUp(path, propKey);
        }
    }
    hookUp(path, propKey) {
        // if(!propSubscribers.has(this.#target)){
        //     propSubscribers.set(this.#target, {});
        // }
        // const subscribers = propSubscribers.get(this.#target)!;
        // if(subscribers[propKey] === undefined){
        //     subscribers[propKey] = path;
        let proto = this.#target;
        let prop = Object.getOwnPropertyDescriptor(proto, propKey);
        while (proto && !prop) {
            proto = Object.getPrototypeOf(proto);
            prop = Object.getOwnPropertyDescriptor(proto, propKey);
        }
        if (prop === undefined) {
            throw { target: this.#target, propKey, message: "Can't find property." };
        }
        const setter = prop.set.bind(this.#target);
        const getter = prop.get.bind(this.#target);
        Object.defineProperty(this.#target, propKey, {
            get() {
                return getter();
            },
            set(nv) {
                //const observers = propSubscribers.get(this.#target)![propKey];
                setter(nv);
                const aWin = window;
                const appHistory = aWin.appHistory;
                const current = appHistory.current?.getState();
                const objToMerge = {};
                let cursor = objToMerge;
                const split = path.split('.');
                for (let i = 0, ii = split.length; i < ii; i++) {
                    if (i === ii - 1) {
                        cursor[split[i]] = nv;
                    }
                    else {
                        const newObj = {};
                        cursor[split[i]] = newObj;
                        cursor = newObj;
                    }
                }
                const state = mergeDeep(current, objToMerge);
                appHistory.updateCurrent({
                    state
                });
            },
            enumerable: true,
            configurable: true
        });
    }
}
const tagName = 'be-transactional';
const ifWantsToBe = 'transactional';
const upgrade = 'template';
define({
    config: {
        tagName,
        propDefaults: {
            ifWantsToBe,
            upgrade,
            noParse: true,
        }
    }
});
register(ifWantsToBe, upgrade, tagName);
