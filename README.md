# i18n Collector

A extensão do Visual Studio Code para coletar textos e gerar arquivos de internacionalização (`i18n`). Facilita a tradução e a substituição de textos em seu código por chaves de tradução, permitindo suporte a múltiplos idiomas e formatos de chave.

## Funcionalidades

- **Coleta de Textos:** Selecione textos no seu código e substitua-os automaticamente por chaves de tradução.
- **Suporte a Múltiplos Idiomas:** Escolha o idioma para o qual deseja coletar textos e gerar o arquivo `i18n`.
- **Geração Automática de Chaves:** Crie chaves únicas e legíveis para os textos coletados.
- **Detecção de Duplicatas:** Evite a criação de chaves duplicadas e reutilize chaves existentes.
- **Personalização do Arquivo i18n:** Defina o nome do arquivo de saída e o formato das chaves.
- **Abertura do Arquivo i18n:** Abra e visualize facilmente o arquivo `i18n` gerado.
- **Suporte a Múltiplas Linguagens de Programação:** Substitua textos pelo formato adequado para PHP, JavaScript, Laravel, Vue.js e React.

## Comandos

### `i18n-collector.setLanguage`

Define o idioma para o qual os textos serão coletados. Suporte para idiomas como inglês (en), espanhol (es), francês (fr), alemão (de), português (pt) e italiano (it).

### `i18n-collector.setProgrammingLanguage`

Define a linguagem de programação utilizada no projeto. As opções são PHP, JavaScript, Laravel, Vue.js e React.

### `i18n-collector.collectTexts`

Coleta os textos selecionados e os substitui por chaves de tradução no código. Atualiza ou cria o arquivo `i18n` na raiz do projeto.

### `i18n-collector.openI18nFile`

Abre o arquivo `i18n` gerado para visualização e edição.

## Configuração

Você pode configurar a extensão nas configurações do VSCode:

- **`i18nCollector.fileName`**: Nome do arquivo de saída para o arquivo `i18n`. (Padrão: `i18n`)
- **`i18nCollector.slugFormat`**: Formato das chaves. Pode ser `camelCase`, `PascalCase` ou `lowercase_underscore`. (Padrão: `lowercase_underscore`)

## Exemplo

1. Selecione o texto a ser internacionalizado no seu código.
2. Pressione `Alt+N` para coletar e substituir o texto por uma chave.
3. O arquivo `i18n` será atualizado com a nova chave e o texto associado.

### Exemplo de Substituição

- **Texto Original:** `Registar Utilizador`
- **Chave Gerada:** `register_user`
- **Substituição no Código:**
  - **PHP:** `__('register_user')`
  - **Laravel:** `{{ __('register_user') }}`
  - **Vue.js:** `{{ $t('register_user') }}`
  - **React:** `{t('register_user')}`
  - **JavaScript:** `t('register_user')`

## Instalação

1. Abra o Visual Studio Code.
2. Vá para a aba de Extensões (Ctrl+Shift+X).
3. Pesquise por "i18n Collector".
4. Clique em "Instalar".

## Contribuições

Contribuições são bem-vindas! Se você encontrar algum problema ou tiver sugestões, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](https://app.gexter.net/politica-de-privacidade) para mais detalhes.

---

Feito com 💜 por [Inoque Lubanzadio](https://github.com/inmx).
