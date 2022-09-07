import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
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
            await this.hookUp(path, propKey);
            await this.updateHistory(path, propKey, target[propKey]);
        }
    }
    async finale(proxy, target, beDecorProps) {
        const { unsubscribe } = await import('trans-render/lib/subscribe.js');
        unsubscribe(target);
    }
    async updateHistory(path, propKey, newValue) {
        requestIdleCallback(async () => {
            const aWin = window;
            const navigation = aWin.navigation;
            const current = navigation.currentEntry?.getState() || {};
            const objToMerge = {};
            let cursor = objToMerge;
            const split = path.split('.');
            for (let i = 0, ii = split.length; i < ii; i++) {
                if (i === ii - 1) {
                    cursor[split[i]] = newValue;
                }
                else {
                    const newObj = {};
                    cursor[split[i]] = newObj;
                    cursor = newObj;
                }
            }
            const { mergeDeep } = await import('trans-render/lib/mergeDeep.js');
            const state = mergeDeep(current, objToMerge);
            //https://developer.chrome.com/docs/web-platform/navigation-api/#setting-state
            navigation.navigate(location.href, { state, history: 'replace', info: { mergedObject: objToMerge, path, newValue } });
        });
    }
    async hookUp(path, propKey) {
        const { subscribe } = await import('trans-render/lib/subscribe.js');
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
