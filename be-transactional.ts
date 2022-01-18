import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {BeTransactionalVirtualProps, BeTransactionalActions, BeTransactionalProps} from './types';
import {register} from 'be-hive/register.js';

export class BeTransactionalController implements BeTransactionalActions{

}

export interface BeTransactionalController extends BeTransactionalProps{
}

const tagName = 'be-transactional';

const ifWantsToBe = 'transactional';

const upgrade = 'template';

define<BeTransactionalProps & BeDecoratedProps<BeTransactionalProps, BeTransactionalActions>>({
    config: {
        tagName,
        propDefaults:{
            ifWantsToBe,
            upgrade,
        }
    }
});