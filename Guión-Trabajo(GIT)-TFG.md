# Guión de Trabajo (GIT) - TFG

---

## GitFlow

1. 2 Ramas iniciales:
   - **main**
   - **dev**
2. Por cada feature se creará una rama **feature/nombre-de-la-feature**.
   - **feature** deriva de la rama **dev**.
3. En caso de encontrar un error en el programa, se creara una nueva rama llamada **fix/nombre-del-bug**.
   - **fix** deriva de la rama **dev**.
4. Tras la aprobación de la **feature** se hara merge en **dev**, y tras finalizar los objetivos deseados se hara merge en **main**.

### Gitflow - Ejemplo

```txt
Repositorio
|__ main
|__ dev
    |__ feature/signin
    |__ feature/signup
    |__ fix/view-signin
```

---

## Commits

- Priorizar en el commit el cambio más relevante.
- Evitar grandes commits, priorizar commits pequeños.
- Mensaje conciso, en el titulo.
  - Se permite extenderse en la descripción.

### Estructura del del commit

```bash
(<Nomenclatura(Mayusculas)>)-<Nombre del documento>: <Titulo del commit>

<Descripción>
```

#### Ejemplo visual

```bash
(VAR)(LOG)-pokedex.js: Modificación en la convención de las variables.

Modficación en las variables de camelCase a snake case.
```

```bash
(DOC)-entrenador.js: Modificación en la documentación del entrenador.

Modificación de la documentación presente en la clase entrenador.js, indicando y detallando de forma más clara y concisa que hace cada uno de los atributos presentes.
```

### Nomenclatura general

- **(MRG)** - Hace referencia a un cuando se realiza un merge.
- **(RST)** - Hace referencia a un cuando se realiza un reset.
- **(INS)** - Hace referencia a un insert en el respositorio.
- **(DEL)** - Hace referencia a un delete en el respositorio.
- **(---)** - Hace referencia a cambios varios de mismo grado de importancia.
- **(NOM)** - Hace referencia a un cambio en el nombre de un elemento, puede ser variables, funciones, etc...
- **(VAR)** - Hace referencia a un cambio en las variables.
- **(CLS)** - Hace referencia a un cambio en las clases.
- **(LOG)** - Hace referencia a un cambio en el apartado lógico.
- **(DOC)** - Hace referencia a un cambio en la documentación.
 
### Nomenclatura específica - Node

- **(VST)** - Hace referencia a un cambio en la vista.
- **(MOD)** - Hace referencia a un cambio en el modelo.
- **(RUT)** - Hace referencia a un cambio en la ruta.
- **(APP)** - Hace referencia a un cambio en la APP.

### Nomenclatura específica - WPF

- **(XAM)** - Hace referencia a un cambio en XAML.
- **(CSP)** - Hace referencia a un cambio en C#.

---

## Alias recomendados

### git lg

- Comando que muestra el log, resumido y con la información necesaria.

```bash
git config --global alias.lg "log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all"
```

### git s

- Mostar el estado de forma resumida.

```bash
git config --global alias.s status --short
```

---
