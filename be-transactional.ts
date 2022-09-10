import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {VirtualProps, BeTransactionalActions, ProxyProps, Proxy} from './types';
import {register} from 'be-hive/register.js';
import {Navigation} from './navigation_api';


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
            const pram = params[propKey]
        }
        proxy.resolved = true;
        // for(const propKey in propPathMap){
        //     const path = propPathMap[propKey] as string;
        //     await this.hookUp(path, propKey);
        //     await this.updateHistory(path, propKey, (<any>target)[propKey]);
        // }   
    }

    async finale(proxy: Proxy, target: Element, beDecorProps: BeDecoratedProps){
        const {unsubscribe} = await import('trans-render/lib/subscribe.js');
        unsubscribe(target);
    }

    async updateHistory(path: string, propKey: string, newValue: any){
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