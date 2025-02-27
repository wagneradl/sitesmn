# Instruções de Deployment para o Site SMN

Este documento fornece instruções detalhadas para o deployment correto do site SMN Tecnologia.

## Estrutura do Projeto

O site é composto principalmente por:
- Arquivos HTML estáticos
- Arquivos CSS para estilização
- JavaScript para interatividade
- Um componente PHP para processamento do formulário de currículo

## Requisitos do Servidor

Para o funcionamento correto do site, o servidor deve possuir:

1. **Suporte a PHP 7.0+** (necessário para o formulário de contato)
2. **Módulo de email PHP habilitado** (função `mail()` deve estar disponível)
3. **Configuração MIME para anexos** (para garantir que os PDFs sejam enviados corretamente)

## Processo de Deployment

### 1. Configuração do Formulário PHP

O arquivo `submit-curriculo.php` precisa ser configurado corretamente:

- Verifique o endereço de email em `$to = 'oportunidades@smn.com.br';` (linha 5)
- Se necessário, ajuste o tamanho máximo do arquivo permitido (`$max_file_size`)
- Em ambiente de produção, mantenha o log desabilitado (`$log_enabled = false;`) ou ajuste para um local seguro

### 2. Upload para o Servidor

- Faça upload de todos os arquivos mantendo a estrutura de diretórios
- Certifique-se de que as permissões dos arquivos estão corretas:
  - Arquivos HTML, CSS, JS: 644 (rw-r--r--)
  - Arquivos PHP: 644 (rw-r--r--)
  - Diretórios: 755 (rwxr-xr-x)

### 3. Configuração do Servidor Web

#### Para Apache

Crie ou ajuste o arquivo `.htaccess` na raiz do site:

```apache
# Redirecionar para HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Configurar tipos MIME
AddType application/pdf .pdf

# Compressão GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript
</IfModule>

# Cache de navegador
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

#### Para Nginx

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;
    
    # Redirecionar para HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name seudominio.com.br www.seudominio.com.br;
    
    # Configurações SSL (ajuste conforme certificado)
    ssl_certificate /caminho/para/certificado.crt;
    ssl_certificate_key /caminho/para/chave.key;
    
    root /caminho/para/o/site;
    index index.html;
    
    # Configurações de cache
    location ~* \.(jpg|jpeg|png|svg)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
    
    location ~* \.(css|js)$ {
        expires 1M;
        add_header Cache-Control "public";
    }
    
    # Processamento PHP
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock; # Ajuste conforme versão
    }
}
```

### 4. Configuração do PHP

Verifique e ajuste o arquivo `php.ini` do servidor para garantir:

```
; Configuração necessária para upload de arquivos
file_uploads = On
upload_max_filesize = 10M
post_max_size = 12M
max_file_uploads = 20

; Configuração do email
[mail function]
SMTP = seu-servidor-smtp.com
smtp_port = 25
sendmail_from = noreply@seudominio.com.br
```

### 5. Configuração do Google Analytics

O código do Google Analytics já está inserido no site, mas com um placeholder para o ID:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Substitua `G-XXXXXXXXXX` pelo ID real do Google Analytics.

### 6. DNS e Certificados SSL

- Configure os registros DNS para apontar para o servidor
- Instale e configure um certificado SSL (Let's Encrypt é uma opção gratuita)

### 7. Testes Pós-Deployment

1. **Teste de Carregamento do Site**
   - Verifique se todas as páginas carregam corretamente
   - Confirme se todos os recursos (imagens, CSS, JS) estão sendo carregados

2. **Teste de Formulário**
   - Envie um currículo de teste para verificar se o processamento PHP está funcionando
   - Confirme se o email está sendo recebido com o anexo correto
   - Teste mensagens de erro ao enviar arquivos muito grandes ou em formato inválido

3. **Teste em Múltiplos Dispositivos**
   - Verifique a responsividade em smartphones, tablets e desktops
   - Teste em diferentes navegadores (Chrome, Firefox, Safari, Edge)

## Considerações sobre Cloudflare Pages

Se o deploy for feito no Cloudflare Pages:

1. O formulário PHP não funcionará diretamente no Cloudflare Pages, pois a plataforma não suporta PHP nativo.

2. **Opções para o formulário:**
   - **Cloudflare Workers**: Implemente a lógica do formulário como uma Cloudflare Worker (usando JavaScript)
   - **API externa**: Hospede apenas o `submit-curriculo.php` em um servidor com PHP e faça solicitações API para ele
   - **Serviço de formulário**: Use um serviço como Formspree, Netlify Forms ou similar

3. **Ajuste no arquivo `curriculo-form.js`**:
   - O script já detecta ambientes estáticos (como Cloudflare Pages) na linha 5-8
   - Em ambientes estáticos, ele fornece feedback visual sem realmente enviar o formulário
   - Se implementar uma das soluções acima, atualize a URL de envio do formulário

## SEO e Otimizações

Consulte o arquivo `SEO_INSTRUCTIONS.md` para orientações detalhadas sobre como otimizar o site para mecanismos de busca, incluindo:
- Configuração de meta tags
- Estrutura de dados Schema.org
- Otimização do sitemap.xml
- Configuração do Search Console

## Manutenção

- Mantenha backups regulares dos arquivos do site
- Monitore os logs de erro do servidor para identificar problemas
- Verifique periodicamente se o formulário de contato está funcionando corretamente

---

Documento criado em: 27 de fevereiro de 2025  
Última atualização: 27 de fevereiro de 2025
