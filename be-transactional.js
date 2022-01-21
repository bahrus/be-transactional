import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
import { mergeDeep } from 'trans-render/lib/mergeDeep.js';
import { subscribe } from 'trans-render/lib/subscribe.js';
const guid = 'dngmX6Rkq0SEOT4Iqu7fCQ==';
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
            this.updateHistory(path, propKey, target[propKey]);
        }
    }
    updateHistory(path, propKey, nv) {
        requestIdleCallback(() => {
            const aWin = window;
            const appHistory = aWin.appHistory;
            const current = appHistory.current?.getState() || {};
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
        });
    }
    hookUp(path, propKey) {
        subscribe(this.#target, propKey, (element, propKey, nv) => {
            this.updateHistory(path, propKey, nv);
        });
    }
}
const tagName = 'be-transactional';
const ifWantsToBe = 'transactional';
const upgrade = '*';
define({
    config: {
        tagName,
        propDefaults: {
            ifWantsToBe,
            upgrade,
            noParse: true,
            intro: 'intro',
            virtualProps: [],
        }
    },
    complexPropDefaults: {
        controller: BeTransactionalController
    }
});
register(ifWantsToBe, upgrade, tagName);
