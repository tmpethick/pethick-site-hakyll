
# Personal Blog

This is the source code for my personal blog.

## Setup

Requirements:

```
cabal install pandoc-2.1.3
cabal install pandoc-crossref-0.3.1.0
cabal install pandoc-sidenote-0.19.0.0
```

To do a full rebuild and start watching the files:

```
PATH=/Users/tmpethick/Library/Haskell/bin:$PATH
stack build && stack exec site rebuild && stack exec site watch
```

To enable livereload install the LiveReload browser plugin and run:
```
npm install
node livereload.js
```

## Publish

```
./deploy
```

**Warning**: This will build using the local version *including uncommitted files*.

# TODO

The most prominent features currently supported are server side math rendering to support arbitrary latex packages, references with hyperlinks and citations.

- [x] Render math to image to support arbitrary latex packages (using [`latex-formulae`](https://github.com/liamoc/latex-formulae)).
  - [ ] Specify packages in `preamble` using `[String]` instead of `String` for readability.
- [x] Bibliography support with a `.bib` file for each post (using Hakyll's `readPandocBiblio`)
  - https://github.com/mcmtroffaes/homepage/blob/master/posts/2015-01-09-hakyll-and-bibtex.markdown
  - https://github.com/citation-style-language/styles
  - https://www.zotero.org/styles
- [x] Reference section, figure and equations *with links* (using [`pandoc-crossref`](https://lierdakil.github.io/pandoc-crossref/)).
- [x] Let top post heading be `h2` (using Haskell Tag transformation to avoid messing up [`pandoc-crossref`]s numbering).
- [x] Number sections (using [`pandoc-crossref`]).
- [x] Style h5 similar to Latex paragraph in a pdf.
- [x] Strips `.html` from urls.
- [x] Render html5 sections.
- [x] Equations in figures (Using [`pandoc-crossref`] subfigure hack).
- [x] Definition style.
- [x] Ignore `README.md`.
- [x] Render Edward Tufte style.
  - [x] Sidenotes.
  - [ ] Margin figures.
  - [ ] Wide figures.
  - [ ] Wide tables.
- [x] Google analytics.
- [x] Github compatible.
- [ ] Improve markdown:
  - [ ] Ignore indentation (like latex).
  - [ ] Comments in markdown (like latex).
- [ ] Hyperlinks for citations <sup id="a1">[1](#link-citation-footnote)</sup>.
- [ ] PDF output using latex.
  - [ ] See https://ickc.github.io/pandoc-amsthm/ for going from our thm/lm/proof markdown syntax to latex.
- [ ] Make subfigure output semantic (use `figure` and `figcaption`).
- [ ] Feed.
- [ ] Tags.
- [x] Live reload (see https://github.com/jaspervdj/hakyll/issues/140)
- [x] Fix styling for sidenotes
- [x] Remove left sidebar
- [ ] Theorem pandoc compatibility: possibly use pandocs new content-blocks `::: theorem` https://github.com/vsch/flexmark-java/issues/327
- [ ] Reference Theorems with crossref.


# Guide to Self

Reference using:

```md
# My section {#sec:my}

[@sec:my]
```

Cite using:

```md
[@citeid]
```

Equations inside figure (hackishly using subfigures):

```md
<div id="fig:eq1">
$$The equation$$

This is the description.
</div>
```

Definition style:

```md
<div class="definition">
<header>
#### Title
Some explanatory:

</header>
<div class="definition-body">
Here's the definition.
</div>
</div>
```

Create code with line numbers (uses `pandoc-sidenote`):

~~~~~~~~~~md
```{.haskell .numberLines}
merge []         ys                   = ys
merge xs         []                   = xs
merge xs@(x:xt) ys@(y:yt) | x <= y    = x : merge xt ys
                          | otherwise = y : merge xs yt

split (x:y:zs) = let (xs,ys) = split zs in (x:xs,y:ys)
split [x]      = ([x],[])
split []       = ([],[])

mergeSort []  = []
mergeSort [x] = [x]
mergeSort xs  = let (as,bs) = split xs
                in merge (mergeSort as) (mergeSort bs)
```
~~~~~~~~~~

## Footnotes

The footnote syntax can be found here: 

https://rephrase.net/box/word/footnotes/syntax/

<b id="link-citation-footnote">1)</b>
Possible using `-F pandoc-citeproc --metadata link-citations=true`. We might have to do it in haskell by setting `WriterOptions` [↩](#a1):

```haskell
  , writerCiteMethod = Citeproc 
  , writerVariables = [("link-citations", "true")] 
```

[`pandoc-crossref`]: https://lierdakil.github.io/pandoc-crossref/
