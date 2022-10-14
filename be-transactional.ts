import {BeDecoratedProps, define} from 'be-decorated/DE.js';
import {VirtualProps, BeTransactionalActions, ProxyProps, Proxy, ITransactionalParam, CurrentEntryChange} from './types';
import {register} from 'be-hive/register.js';
import {Navigation} from './navigation_api';
import { IMinimalNotify } from 'trans-render/lib/types';
import {Hashit} from 'trans-render/lib/Hashit.js';

const guidLHS = '3a61e61d-6d36-4f';
const guidRHS = '7a-923d-baf3655def2c';
const guid = guidLHS + guidRHS;
const navigation = (<any>window).navigation as Navigation;

const hashit = new Hashit(guidLHS, guidRHS);



if(navigation.currentEntry?.getState() === undefined){
    const state = hashit.parse('currentEntry');
    if(state !== null){
        navigation.updateCurrentEntry({state});
    }
}

navigation.addEventListener('navigate', navigateEvent => {
    if((<any>navigateEvent?.info)?.guid === guid){
        navigateEvent.intercept({
            async handler() {
                return undefined;
            },
        });
    }

});


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
            
            const current = navigation.currentEntry?.getState() || {} as any;
            const mergeObject = {} as any;
            let cursor = mergeObject;
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
            const state = mergeDeep(current, mergeObject);

            //https://developer.chrome.com/docs/web-platform/navigation-api/#setting-state

            const hashSplit = location.href.split('#');
            const newHash = hashit.stringify('currentEntry', state);
            navigation.navigate(hashSplit[0] + '#' + newHash, {history: 'replace', state, info:{path, mergeObject, newValue, guid}})
        });
    }


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