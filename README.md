# La base de code de vos applications Angular toujours bien formatée avec Prettier

D'un projet à l'autre, les règles de formatage de code peuvent varier sensiblement et il n'est pas toujours facile de les suivre à la lettre. Même au sein de petites équipes, vous avez sans doute déjà rencontré du code au formatage non homogène, ce qui n'en facilite pas la compréhension. Alors, pour favoriser un formatage particulier au sein de votre équipe, vous pouvez écrire un long guide de contribution, mais il vous faudra dépenser pas mal d'énergie pour le promouvoir et plus encore pour le faire respecter.

Au lieu de cela, je vous propose de mettre en place un __outil de formatage de code automatisable__ très populaire : [Prettier](https://prettier.io/). À la fin de ce tutoriel, vous saurez comment intégrer Prettier dans vos applications [Angular](https://angular.io/), pour qu'il fonctionne harmonieusement avec [TSLint](https://palantir.github.io/tslint/). Et vous serez en mesure de formater le code à partir de la ligne de commande, depuis votre IDE pendant que vous développez, mais aussi juste avant de pousser vos précieuses modifications sur votre gestionnaire de sources, [Git](https://git-scm.com/).

## Prérequis

Je suppose que vous avez déjà installé [Node.js](https://nodejs.org) et [Angular CLI](https://cli.angular.io/) sur votre machine. Ensuite, vous pouvez partir d'une application existante (à condition de l'avoir généré avec Angular CLI) ou en créer une nouvelle de la manière suivante :

```bash
cd angular-prettier
```

## Mais TSLint ne fait-il pas déjà le job ?

TSLint fait partie de l'outillage de toute application Angular générée avec Angular CLI. Pour rappel, TSLint est un outil d'analyse statique, qui définie des règles permettant d'augmenter la qualité du code TypeScript en termes de __lisibilité__, __maintenabilité__ et __fonctionnalité__.

Voici un exemple de règle pour chaque catégorie :

- Limiter le nombre maximal de caractères par ligne ([max-line-length](https://palantir.github.io/tslint/rules/max-line-length/)) permet de rendre le code plus __lisible__.
- Limiter le nombre de `if` imbriqués dans une fonction ([cyclomatic-complexity](https://palantir.github.io/tslint/rules/cyclomatic-complexity/)) permet de rendre le code plus __maintenable__.
- Déclarer des variables uniquement si on les utilise ([no-unused-variable](https://palantir.github.io/tslint/rules/no-unused-variable/)) permet d'assurer la bonne __fonctionnalité__ du programme.

Alors pour faire simple, dans cet article nous parlerons d'__erreurs de formatage__ en référence aux règles de lisibilité et d'__erreurs fonctionnelles__ en référence aux règles de maintenabilité ou de fonctionnalité.

Et voilà où je voulais en venir : si TSLint est capable d'identifier les erreurs de formatage alors pourquoi déléguer cette tâche à Prettier ?

La réponse en est que TSLint ne permet pas d'automatiser totalement le formatage de code. Par exemple, la règle `max-line-length` ne peut pas être corrigée automatiquement (on ne peut pas exécuter `tslint --fix` en ligne de commande pour cette règle) alors que comme nous le verrons, Prettier prend très bien cela en charge. De plus TSLint ne formate que les fichiers TypeScript alors que Prettier formate d'autres types de fichiers comme les fichiers HTML et CSS par exemple.

__C'est pourquoi nous allons garder TSLint pour ce qu'il fait de mieux, à savoir la recherche des erreurs fonctionnelles et prendre Prettier pour l'automatisation du formatage de code.__

Aller, cette fois c'est parti !

## Configurer Prettier

Ajoutons un fichier `.prettierrc` à la racine de l'espace de travail :

```json
{
  "singleQuote": true,
  "printWidth": 140,
  "trailingComma": "all"
}
```

Ce fichier de configuration va surcharger la configuration par défaut de Prettier. Il nous suffit donc d'ajouter les propriétés spécifiques qui correspondent à notre besoin.

Utilisons les guillemets simples avec la propriété `singleQuote` et augmentons la longueur des lignes à 140 caractères, pour coller au plus proche de la configuration TSLint d'origine. Cependant, rien ne vous empêche de changer ces règles pour les adapter à votre style. Enfin, à titre personnel, j'aime bien utiliser la propriété `trailingComma` pour ajouter une virgule au dernier élément d'un tableau multi-lignes par exemple. Mais là aussi, rien ne vous empêche de faire autrement.

Ensuite, ajoutons un autre fichier `.prettierignore` pour lister les fichiers que nous ne souhaitons pas formater.

```txt
/*
!/e2e
!/projects
!/src
assets/
browserslist
package*.json
*.ico
```

Cette configuration se base sur la [syntaxe des fichiers `.gitignore`](https://git-scm.com/docs/gitignore). Nous indiquons ici qu'il faut ignorer tous les fichiers de l'espace de travail à l'exception de `/e2e`, `/projects` et `/src` qui contiennent notre code métier. Pour rappel, vous aurez un dossier `/projects` si vous générez une librairie avec la commande `ng generate library`). Enfin, à l'intérieur des dossiers restants, on ignore certains dossiers (comme `assets/`) et certains fichiers (comme `package.json` et `package-lock.json`, dont le formatage est géré automatiquement par NPM).

## Configurer TSLint pour qu'il n'interfère pas avec Prettier

Prettier est maintenant bien configuré, mais TSLint marche encore sur ses plates-bandes. Désactivons les règles de formatage de code propres à TSLint, afin de laisser Prettier libre pour faire ce travail. Pour cela, nous allons installer le paquet `tslint-config-prettier` dont le nom est assez explicite :

```bash
npm i -D tslint-config-prettier
```

Le contenu de ce paquet est très simple et voici à quoi ressemble la [configuration](http://unpkg.com/tslint-config-prettier/lib/index.json) qu'il fournit :

```txt
{
  "rules": {
    "align": false,
    "array-bracket-spacing": false,
    "arrow-parens": false,
    ...
  }
}
```

Vous voyez, il met simplement à `false` toutes les règles de formatage de code gérées par TSLint.

Pour l'utiliser, ajoutons-le au fichier `tslint.json` à la racine de notre espace de travail, qui permet justement de configurer TSLint :

```txt
{
  "extends": [
    "tslint:recommended",
    "tslint-config-prettier"
  ],
  "rules": {
    ...
  },
  "rulesDirectory": [
    "codelyzer"
  ]
}
```

Attention, placez bien la configuration `tslint-config-prettier` en dernière position du tableau `extends` !

Nous y sommes presque ! La section `rules` de ce même fichier `tslint.json` a priorité sur ce qui est défini dans la section `extends`. Nous devons donc retirer de cette section les règles de formatage de code, sans toucher aux règles d'analyse statique d'erreurs fonctionnelles spécifiques d'Angular.

Pour identifier ces règles, nous avons 2 solutions :

- nous référer à la section "Format" de la page [https://palantir.github.io/tslint/rules/](https://palantir.github.io/tslint/rules/)
- consulter la page [http://unpkg.com/tslint-config-prettier/lib/index.json](http://unpkg.com/tslint-config-prettier/lib/index.json) qui liste les règles en question.

Bon aller, je vous donne la solution ! Voici les 5 règles que nous devons retirer :

- `arrow-parens`
- `max-line-length`
- `no-consecutive-blank-lines`
- `quotemark`
- `trailing-comma`

Finalement notre fichier `tslint.json` devrait maintenant ressembler à cela (j'utilise la version 8.3 d'Angular) :

```json
{
  "extends": [
    "tslint:recommended",
    "tslint-config-prettier"
  ],
  "rules": {
    "array-type": false,
    "deprecation": {
      "severity": "warning"
    },
    "component-class-suffix": true,
    "contextual-lifecycle": true,
    "directive-class-suffix": true,
    "directive-selector": [
      true,
      "attribute",
      "app",
      "camelCase"
    ],
    "component-selector": [
      true,
      "element",
      "app",
      "kebab-case"
    ],
    "import-blacklist": [
      true,
      "rxjs/Rx"
    ],
    "interface-name": false,
    "max-classes-per-file": false,
    "member-access": false,
    "member-ordering": [
      true,
      {
        "order": [
          "static-field",
          "instance-field",
          "static-method",
          "instance-method"
        ]
      }
    ],
    "no-console": [
      true,
      "debug",
      "info",
      "time",
      "timeEnd",
      "trace"
    ],
    "no-empty": false,
    "no-inferrable-types": [
      true,
      "ignore-params"
    ],
    "no-non-null-assertion": true,
    "no-redundant-jsdoc": true,
    "no-switch-case-fall-through": true,
    "no-use-before-declare": true,
    "no-var-requires": false,
    "object-literal-key-quotes": [
      true,
      "as-needed"
    ],
    "object-literal-sort-keys": false,
    "ordered-imports": false,
    "no-conflicting-lifecycle": true,
    "no-host-metadata-property": true,
    "no-input-rename": true,
    "no-inputs-metadata-property": true,
    "no-output-native": true,
    "no-output-on-prefix": true,
    "no-output-rename": true,
    "no-outputs-metadata-property": true,
    "template-banana-in-box": true,
    "template-no-negated-async": true,
    "use-lifecycle-interface": true,
    "use-pipe-transform-interface": true
  },
  "rulesDirectory": [
    "codelyzer"
  ]
}
```

Et voilà, Prettier et TSLint sont bien configurés dans notre application Angular !

## Exécuter Prettier sur l'espace de travail

Pour exécuter Prettier, il nous faut maintenant l'installer :

```bash
npm i -D prettier
```

L'exécutable est accessible depuis le dossier `./node_modules/.bin/prettier`. Nous pouvons exécuter la commande avec l'option `--check` (pour lister les fichiers problématiques sans les modifier) ou avec l'option `--write` (pour les modifier). C'est magique !

```txt
$ ./node_modules/.bin/prettier --check "**"

Checking formatting...
e2e/protractor.conf.js
e2e/src/app.e2e-spec.ts
e2e/tsconfig.json
src/app/app.component.html
src/app/app.component.spec.ts
src/app/app.component.ts
src/app/app.module.ts
src/environments/environment.prod.ts
src/environments/environment.ts
src/index.html
src/main.ts
src/polyfills.ts
src/test.ts
Code style issues found in the above file(s).

$ ./node_modules/.bin/prettier --write "**"
```

Si besoin, nous pouvons ajouter un script NPM au fichier `package.json`, pour nous simplifier la vie :

```txt
{
  ...
  "scripts": {
    ...
    "prettier:check": "prettier --check \"**\"",
    "prettier": "prettier --write \"**\"",
    ...
  },
  ...
}
```

## Intégrer Prettier à notre IDE

Si comme moi vous utilisez __VSCode__, je vous propose alors d'installer le plugin [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). Celui-ci va nous permettre de formater un fichier ouvert dans notre IDE à partir du __menu contextuel__ "Formatter le document", sans passer par la ligne de commande.

Nous pouvez même aller plus loin en configurant VSCode pour formater un fichier ouvert dès que nous le sauvegardons, avec l'option `editor.formatOnSave` :

```json
{
  "editor.formatOnSave": true
}
```

Si vous êtes plutôt __IntelliJ__, voici le plugin équivalent pour votre IDE : [Prettier](https://plugins.jetbrains.com/plugin/10456-prettier).

## Exécuter Prettier avant chaque commit avec husky et pretty-quick !

Nous sommes maintenant capables d'exécuter Prettier en ligne de commande ou directement depuis notre IDE. Si comme moi vous utilisez Git comme gestionnaire de source, je vous propose alors d'ajouter un "hook" pour exécuter Prettier avant chaque commit, sur tous les fichiers modifiés. Pour rappel, les crochets ("hooks") sont tout simplement des scripts qui s'exécutent automatiquement lorsqu'une action bien précise est déclenchée.

Installons 2 autres paquets qui vont nous permettre très simplement d'exécuter Prettier avant chaque commit :

```bash
npm i -D husky pretty-quick
```

- `husky` : permet de configurer les hooks de Git.
- `pretty-quick` : permet d'exécuter Prettier uniquement sur les fichiers qui ont été modifiés.

Il ne reste plus qu'a configurer `husky` pour exécuter `pretty-quick` avant chaque commit. Nous pouvons par exemple renseigner cette configuration dans le fichier `package.json` :

```txt
{
  "scripts": {
    ...
  },
  ...
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged"
    }
  }
}
```

Et voilà, le tour est joué !

## Take away

Dans ce tutoriel, vous avez appris à configurer __Prettier__ dans vos applications __Angular__, adapter la configuration __TSLint__ en conséquence et utiliser Prettier pour formater votre code en __ligne de commande__, dans votre __IDE__ ou automatiquement avant chaque __commit Git__.

Et rappelez-vous que je vous ai économisé l'écriture d'un long guide de contribution à l'attention de votre équipe, alors happy coding ^^ !

## Ressource

Code source du tutoriel sur notre dépôt Github : [https://github.com/xebia-france/angular-prettier](https://github.com/xebia-france/angular-prettier).
