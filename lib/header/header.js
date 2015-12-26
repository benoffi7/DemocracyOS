import Header from './view.js';

import page from 'page';
import bus from 'bus';
import o from 'component-dom';
import config from '../config/config.js';
import { clearConfig, findConfig } from '../confighome-middlewares/confighome-middlewares';

/**
 * Create header instance
 */

var header= null;

page('*', findConfig, (ctx, next) => {
    config.headerBackgroundColor= ctx.confighome.menuColor;
    config.logo= ctx.confighome.logo;
    
    header = new Header;

    // Render header
    header.replace('header.app-header');
    
    next();
});

/*
 * Esto no se usa mas
 * Aca el header iba directo pero no permitia que sea configurable por base de datos
 */
//let header = new Header;
//
//// Render header
//header.replace('header.app-header');

/**
 * Expose header instance
 */

export default header;
