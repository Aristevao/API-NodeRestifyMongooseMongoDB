/* Logging com Restify e PM2
    Arquivo criado em commom por ser usado em diversos lugares    */

    import * as bunyan from 'bunyan'
import { environment } from './environment'

    export const logger = bunyan.createLogger({
        name: environment.log.name,
        level: (<any>bunyan).resolveLevel(environment.log.level) // bunyan precisa de um log level predefinido, como está sendo usado uma string importada do environment.ts, é preciso usar o resolveLevel
    })