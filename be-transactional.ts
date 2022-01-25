import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {BeTransactionalVirtualProps, BeTransactionalActions, BeTransactionalProps} from './types';
import {register} from 'be-hive/register.js';
import {AppHistory} from './appHistory';
import {mergeDeep} from 'trans-render/lib/mergeDeep.js';
import {subscribe, unsubscribe} from 'trans-render/lib/subscribe.js';

const guid = 'dngmX6Rkq0SEOT4Iqu7fCQ==';

declare function requestIdleCallback(callback: () => void): void;

export class BeTransactionalController implements BeTransactionalActions{
    #target!: Element;
    async intro(proxy: Element & BeTransactionalVirtualProps, target: Element, beDecorProps: BeDecoratedProps){
        this.#target = target;
        if(target.localName.includes('-')){
            await customElements.whenDefined(target.localName);
        }
        const propPathMap = JSON.parse(proxy.getAttribute('is-' + beDecorProps.ifWantsToBe!)!);
        for(const propKey in propPathMap){
            const path = propPathMap[propKey] as string;
            this.hookUp(path, propKey);
            this.updateHistory(path, propKey, (<any>target)[propKey]);
        }   
    }

    finale(proxy: Element & BeTransactionalVirtualProps, target: Element, beDecorProps: BeDecoratedProps){
        unsubscribe(target);
    }

    updateHistory(path: string, propKey: string, nv: any){
        requestIdleCallback(() => { //TODO:  queue changes?
            const aWin = window as any;
            const appHistory = aWin.appHistory as AppHistory;
            const current = appHistory.current?.getState() || {} as any;
            const objToMerge = {} as any;
            let cursor = objToMerge;
            const split = path.split('.');
            for(let i = 0, ii = split.length; i < ii; i++){
                if(i === ii - 1){
                    cursor[split[i]] = nv;
                }else{
                    const newObj = {} as any;
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

    hookUp(path: string, propKey: string){
        subscribe(this.#target, propKey, (element: Element, propKey: string, nv: any) => {
            this.updateHistory(path, propKey, nv);
        });
    }
}

export interface BeTransactionalController extends BeTransactionalProps{}

const tagName = 'be-transactional';

const ifWantsToBe = 'transactional';

const upgrade = '*';

define<BeTransactionalProps & BeDecoratedProps<BeTransactionalProps, BeTransactionalActions>>({
    config: {
        tagName,
        propDefaults:{
            ifWantsToBe,
            upgrade,
            noParse: true,
            intro: 'intro',
            virtualProps:[],
        }
    },
    complexPropDefaults: {
        controller: BeTransactionalController
    }
});

register(ifWantsToBe, upgrade, tagName);