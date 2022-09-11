import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {IValFromEventInstructions, IDIYNotify} from 'trans-render/lib/types';

export interface EndUserProps {}

export interface VirtualProps extends EndUserProps, MinimalProxy{

}

export type Proxy = Element & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy;
}

export interface BeTransactionalActions{
    intro(proxy: Proxy, target: Element, beDecorProps: BeDecoratedProps): void;
    finale(proxy: Proxy, target: Element, beDecorProps: BeDecoratedProps): void;
}

export interface ITransactionalParam extends IValFromEventInstructions, IDIYNotify{
    path: string,
}