/*   Código para explorar req, resp e next.
      ~Arquivo renomeado para mainPast.ts para salvar processo e comentários ao atualizar arquivo.

      Funcionamento: 
      Ao acessar a rota /info com navegador na versão MSIE 7.0, 
      é exibida mensagem pedindo atualização e impede avanço para próxima response.
      
      Mínimo para criar uma aplicação Restify:
        - Criar o Server
        - Configurar as rotas (urls)
        - Ouvir determinada porta
      */

import * as restify from 'restify'

const server = restify.createServer({
  name: 'meat-api',
  version: '1.0.0'
})

server.use(restify.plugins.queryParser()) // Usado para permitir o uso do <req.query>

server.get('/info', [
  (req, resp, next)=>{
    if(req.userAgent() && req.userAgent().includes('MSIE 7.0')){
    // resp.status(400)
    // resp.json({message: 'Please, update your browser'})
    let error: any = new Error()
    error.statusCode = 400
    error.message = 'Please, update your browser'
    return next(error)
  }
  return next() // Indica fim da callback e permite avanço

},(req, resp, next)=>{
  /* Maneiras diferentes de permitir json na web:
      1.  resp.contentType = 'application/json';
      2.  resp.setHeader('Content-Type','application/json');
      Chamada:  resp.send({message: 'hello'}); 

      Ou usar abreviação abaixo: 
      3. resp.json({ message: 'hello })*/
  
  resp.json({
    browser: req.userAgent(),
    method: req.method,
    url: req.href(),
    path: req.path(),
    query: req.query
  })
  return next()
}])

server.listen(3000, ()=>{ // Ouve a porta 3000, e se não houver problema indica mensagem no console
  console.log('API is running on http://localhost:3000')
})
