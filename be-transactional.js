import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
const guid = '3a61e61d-6d36-4f7a-923d-baf3655def2c';
const navigation = window.navigation;
navigation.addEventListener('navigate', navigateEvent => {
    console.log({ navigateEvent });
    if (navigateEvent?.info?.guid === guid) {
        navigateEvent.intercept({
            async handler() {
                return undefined;
            },
        });
    }
});
//declare function requestIdleCallback(callback: () => void): void;
export class BeTransactionalController {
    #controllers = [];
    async intro(proxy, target, beDecorProps) {
        let params = undefined;
        const attr = proxy.getAttribute('is-' + beDecorProps.ifWantsToBe);
        try {
            params = JSON.parse(attr);
        }
        catch (e) {
            console.error({
                e,
                attr
            });
            return;
        }
        const { notifyHookup } = await import('trans-render/lib/notifyHookup.js');
        this.#controllers = [];
        for (const propKey in params) {
            const pram = params[propKey];
            const isPropSet = propKey.endsWith(':onSet');
            const propName = isPropSet ? propKey.substr(0, propKey.length - 6) : undefined;
            const notifyParam = (typeof pram === 'string') ? {
                propName,
                nudge: true,
                path: pram,
            } : pram;
            notifyParam.doOnly = async (target, key, mn, e) => {
                const { getValFromEvent } = await import('trans-render/lib/getValFromEvent.js');
                const pram = mn;
                const val = await getValFromEvent(target, pram, e);
                await this.updateHistory(pram.path, val);
            };
            const handler = await notifyHookup(target, propKey, notifyParam);
            this.#controllers.push(handler.controller);
        }
        proxy.resolved = true;
        // for(const propKey in propPathMap){
        //     const path = propPathMap[propKey] as string;
        //     await this.hookUp(path, propKey);
        //     await this.updateHistory(path, propKey, (<any>target)[propKey]);
        // }   
    }
    disconnect() {
        for (const c of this.#controllers) {
            c.abort();
        }
    }
    async finale(proxy, target, beDecorProps) {
        this.disconnect();
    }
    async updateHistory(path, newValue) {
        requestIdleCallback(async () => {
            const aWin = window;
            const current = navigation.currentEntry?.getState() || {};
            const mergeObject = {};
            let cursor = mergeObject;
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
            const state = mergeDeep(current, mergeObject);
            // const change: CurrentEntryChange = {
            //     [guid]: {
            //         path,
            //         mergeObject,
            //         newValue
            //     }
            // }
            //Object.assign(state, change); //sigh
            //https://developer.chrome.com/docs/web-platform/navigation-api/#setting-state
            //navigation.updateCurrentEntry({state});
            navigation.navigate(location.href, { history: 'replace', state, info: { path, mergeObject, newValue, guid } });
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
