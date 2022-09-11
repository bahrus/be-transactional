import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {VirtualProps, BeTransactionalActions, ProxyProps, Proxy, ITransactionalParam} from './types';
import {register} from 'be-hive/register.js';
import {Navigation} from './navigation_api';
import { IMinimalNotify } from 'trans-render/lib/types';


declare function requestIdleCallback(callback: () => void): void;

export class BeTransactionalController implements BeTransactionalActions{
    #controllers: AbortController[] = [];
    async intro(proxy: Proxy, target: Element, beDecorProps: BeDecoratedProps){
        let params: any = undefined;
        const attr = proxy.getAttribute('is-' + beDecorProps.ifWantsToBe!)!;
        try{
            params = JSON.parse(attr);
        }catch(e){
            console.error({
                e,
                attr
            });
            return;
        }
        const {notifyHookup} =  await import('trans-render/lib/notifyHookup.js');
        
        this.#controllers = [];
        for(const propKey in params){
            const pram = params[propKey];
            const isPropSet = propKey.endsWith(':onSet');
            const propName = isPropSet ?  propKey.substr(0, propKey.length - 6) : undefined;
            const notifyParam: ITransactionalParam = (typeof pram === 'string') ? {
                propName,
                nudge: true,
                path: pram,
            } as ITransactionalParam : pram;
            notifyParam.doOnly = async (target: Element, key: string, mn: IMinimalNotify, e?: Event) => {
                const {getValFromEvent} = await import('trans-render/lib/getValFromEvent.js');
                const pram = mn as ITransactionalParam;
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

    disconnect(){
        for(const c of this.#controllers){
            c.abort();
        }
    }

    async finale(proxy: Proxy, target: Element, beDecorProps: BeDecoratedProps){
        this.disconnect();
    }

    async updateHistory(path: string, newValue: any){
        requestIdleCallback(async () => { //TODO:  queue changes?
            const aWin = window as any;
            const navigation = aWin.navigation as Navigation;
            const current = navigation.currentEntry?.getState() || {} as any;
            const objToMerge = {} as any;
            let cursor = objToMerge;
            const split = path.split('.');
            for(let i = 0, ii = split.length; i < ii; i++){
                if(i === ii - 1){
                    cursor[split[i]] = newValue;
                }else{
                    const newObj = {} as any;
                    cursor[split[i]] = newObj;
                    cursor = newObj;
                }
            }
            const {mergeDeep} = await import('trans-render/lib/mergeDeep.js');
            const state = mergeDeep(current, objToMerge);
            //https://developer.chrome.com/docs/web-platform/navigation-api/#setting-state
            //navigation.navigate(location.href + '#' + newValue, {state, history: 'push', info: {mergedObject: objToMerge, path, newValue}});
            navigation.navigate(location.href, {state, history: 'replace', info: {mergedObject: objToMerge, path, newValue}});
        });
    }

    // async hookUp(path: string, propKey: string){
    //     const {subscribe} = await import('trans-render/lib/subscribe.js');
    //     subscribe(this.#target, propKey, (element: Element, propKey: string, nv: any) => {
    //         this.updateHistory(path, propKey, nv);
    //     });
    // }
}

export interface BeTransactionalController extends ProxyProps{}

const tagName = 'be-transactional';

const ifWantsToBe = 'transactional';

const upgrade = '*';

define<ProxyProps & BeDecoratedProps<ProxyProps, BeTransactionalActions>>({
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