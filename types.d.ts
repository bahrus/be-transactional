import {BeDecoratedProps} from 'be-decorated/types';

export interface BeTransactionalVirtualProps{

}

export interface BeTransactionalProps extends BeTransactionalVirtualProps{
    proxy: Element & BeTransactionalVirtualProps;
}

export interface BeTransactionalActions{
    
}