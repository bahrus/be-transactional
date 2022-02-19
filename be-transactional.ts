import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {BeTransactionalVirtualProps, BeTransactionalActions, BeTransactionalProps} from './types';
import {register} from 'be-hive/register.js';
import {AppHistory} from './appHistory';


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
            await this.hookUp(path, propKey);
            await this.updateHistory(path, propKey, (<any>target)[propKey]);
        }   
    }

    async finale(proxy: Element & BeTransactionalVirtualProps, target: Element, beDecorProps: BeDecoratedProps){
        const {unsubscribe} = await import('trans-render/lib/subscribe.js');
        unsubscribe(target);
    }

    async updateHistory(path: string, propKey: string, nv: any){
        requestIdleCallback(async () => { //TODO:  queue changes?
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
            const {mergeDeep} = await import('trans-render/lib/mergeDeep.js');
            const state = mergeDeep(current, objToMerge);
            appHistory.updateCurrent({
                state
            });
        });
    }

    async hookUp(path: string, propKey: string){
        const {subscribe} = await import('trans-render/lib/subscribe.js');
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