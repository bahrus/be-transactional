import {BeDecoratedProps} from 'be-decorated/types';

export interface BeTransactionalVirtualProps{

}

export interface BeTransactionalProps extends BeTransactionalVirtualProps{
    proxy: Element & BeTransactionalVirtualProps;
}

export interface BeTransactionalActions{
    intro(proxy: Element & BeTransactionalVirtualProps, target: Element, beDecorProps: BeDecoratedProps): void;
    finale(proxy: Element & BeTransactionalVirtualProps, target: Element, beDecorProps: BeDecoratedProps): void;
}