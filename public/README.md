# Diretório public/

Este diretório contém os arquivos estáticos que são servidos diretamente pelo servidor web, sem processamento adicional pelo frontend ou backend. Geralmente, são arquivos que não precisam ser compilados ou transformados durante o processo de build.

### Arquivos Típicos:

- `index.html`: O ponto de entrada principal da aplicação web.
- `favicon.ico`: O ícone da aba do navegador.
- `robots.txt`: Arquivo que instrui os rastreadores de motores de busca sobre quais páginas podem ou não ser indexadas.
- `placeholder.svg`: Imagens de placeholder ou outros ativos gráficos estáticos.

### Uso:

Durante o desenvolvimento, os arquivos neste diretório são servidos diretamente. No build de produção, eles são copiados para o diretório de saída (geralmente `dist/`) e servidos como ativos estáticos.
