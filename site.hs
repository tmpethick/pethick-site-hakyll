--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings, LambdaCase #-}

import Data.Maybe
import Data.Monoid
-- import Data.Monoid (mappend)

import Image.LaTeX.Render
import Image.LaTeX.Render.Pandoc

import System.Directory
import System.FilePath

import Text.Pandoc

import Hakyll
import Hakyll.Contrib.LaTeX

import qualified Data.List as L
import qualified Data.HashMap.Lazy as HM
import qualified Data.Map as M
import qualified Data.Set as S
import qualified Data.Text as T
import qualified Data.Aeson as A
import qualified Text.HTML.TagSoup as TS

--------------------------------------------------------------------------------

-- | Generate route path `/path/index.html` instead of `/path.html`.
-- index.md -> index.html
-- about.md -> about/index.html
cleanRoute :: Routes
cleanRoute = customRoute createIndexRoute
  where
    createIndexRoute ident = 
        case baseName of 
            "index" -> ((`replaceExtension` "html") . toFilePath) ident
            _       -> takeDirectory p </> baseName </> "index.html"
        where 
            p = toFilePath ident
            baseName = takeBaseName p

cleanIndexUrls :: Item String -> Compiler (Item String)
cleanIndexUrls = return . fmap (withUrls cleanIndex)

cleanIndexHtmls :: Item String -> Compiler (Item String)
cleanIndexHtmls = return . fmap (replaceAll pattern' replacement)
    where
        pattern' = "/index.html"
        replacement = const "/"

cleanIndex :: String -> String
cleanIndex url
    | idx `L.isSuffixOf` url = take (length url - length idx) url
    | otherwise            = url
    where idx = "index.html"

--------------------------------------------------------------------------------

isHeadline:: String -> Bool
isHeadline h = h `elem` ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"]

bumpHeadingNumber :: String -> String
bumpHeadingNumber (h:n) = h : (show . (+1) . read) n

bumpHeading :: TS.Tag String -> TS.Tag String
bumpHeading (TS.TagOpen t a) =
        if isHeadline t 
        then TS.TagOpen (bumpHeadingNumber t) a
        else TS.TagOpen t a
bumpHeading (TS.TagClose t) =
        if isHeadline t
        then TS.TagClose (bumpHeadingNumber t)
        else TS.TagClose t
bumpHeading a = a

bumpHeadings :: Item String -> Compiler (Item String)
bumpHeadings = return . fmap (withTags bumpHeading)

--------------------------------------------------------------------------------

readerSettings :: ReaderOptions
readerSettings = def { readerSmart = True
                     , readerOldDashes = True
                     , readerExtensions = 
                          S.insert Ext_tex_math_double_backslash $ S.insert Ext_pipe_tables pandocExtensions
                     }

writerSettings :: WriterOptions
writerSettings = def { writerHighlight = True
                     , writerSectionDivs = True
                     , writerHtml5 = True 
                    --  , writerVariables = [
                    --     ("link-citations", "true")
                    --  ]
                     }

defaultPreamble = "\\usepackage{amsmath}\\usepackage{amssymb}"

formulaSettings :: String -> PandocFormulaOptions
formulaSettings pre
  = defaultPandocFormulaOptions
      { formulaOptions = \case DisplayMath -> displaymath { preamble = pre }
                               _           -> math        { preamble = pre }
      }

convertValue :: A.Value -> String
convertValue (A.String x) = T.unpack x
convertValue y = show y

--------------------------------------------------------------------------------
main :: IO ()
main = do
    renderFormulae <- initFormulaCompilerDataURI 1000 defaultEnv
    hakyll $ do
        match "projects/games/dist/*" $ do
            route   idRoute
            compile copyFileCompiler

        match "projects/games/dist/**/*" $ do
            route   idRoute
            compile copyFileCompiler
    
        match "files/*" $ do
            route   idRoute
            compile copyFileCompiler

        match "files/**/*" $ do
            route   idRoute
            compile copyFileCompiler

        match "images/*" $ do
            route   idRoute
            compile copyFileCompiler

        match "css/*" $ do
            route   idRoute
            compile compressCssCompiler

        match "font/*" $ do
            route   idRoute
            compile copyFileCompiler

        match "font/**/*" $ do
            route   idRoute
            compile copyFileCompiler
    
        match "bib/*.bib" $ compile biblioCompiler
        match "csl/*.csl" $ compile cslCompiler

        match "templates/*" $ compile templateBodyCompiler

        match ("*.md" .&&. complement "README.md") $ do
            route cleanRoute
            compile $ bibtexCompiler renderFormulae
                >>= loadAndApplyTemplate "templates/page.html"    defaultContext
                >>= loadAndApplyTemplate "templates/default.html" defaultContext
                >>= relativizeUrls
                >>= cleanIndexUrls

        create ["publications.html"] $ do
            route cleanRoute
            compile $ do
                publications <- recentFirst =<< loadAll "publications/*"
                let pubCtx = 
                        listField "publications" postCtx (return publications) `mappend`
                        constField "title" "Publications"                      `mappend`
                        defaultContext

                makeItem ""
                    >>= loadAndApplyTemplate "templates/publications.html" pubCtx
                    >>= loadAndApplyTemplate "templates/default.html" pubCtx
                    >>= relativizeUrls  
                    >>= cleanIndexUrls
        
        create ["archive.html"] $ do
            route cleanRoute
            compile $ do
                posts <- recentFirst =<< loadAll "posts/*"
                let archiveCtx =
                        listField "posts" postCtx (return posts) `mappend`
                        constField "title" "Archives"            `mappend`
                        defaultContext

                makeItem ""
                    >>= loadAndApplyTemplate "templates/archive.html" archiveCtx
                    >>= loadAndApplyTemplate "templates/default.html" archiveCtx
                    >>= relativizeUrls
                    >>= cleanIndexUrls

        -- Publications/posts needs to be compiled in order for the list views to detect them
        -- TODO: avoid generating individual publication pages
        match ("publications/*.markdown" .||. "publications/*.md") $ do
            route cleanRoute
            compile $ bibtexCompiler renderFormulae
                    >>= bumpHeadings
                    >>= loadAndApplyTemplate "templates/publication-abstract.html"    postCtx
                    >>= relativizeUrls
                    >>= cleanIndexUrls

        match ("posts/*.markdown" .||. "posts/*.md") $ do
            route cleanRoute
            compile $ bibtexCompiler renderFormulae
                    >>= bumpHeadings
                    >>= loadAndApplyTemplate "templates/post.html"    postCtx
                    >>= loadAndApplyTemplate "templates/default.html" postCtx
                    >>= relativizeUrls
                    >>= cleanIndexUrls

            
--------------------------------------------------------------------------------

bibtexCompiler renderFormulae = do 
    pr <- fmap (maybe defaultPreamble convertValue . HM.lookup "preamble") (getMetadata =<< getUnderlying)
    fp <- flip replaceExtension "bib" . flip replaceDirectory "bib/" <$> getResourceFilePath
    
    let readPandoc' i = do exists <- unsafeCompiler $ doesFileExist fp
                           if exists then do
                               csl <- load $ fromFilePath "csl/ieee-with-url.csl"
                               bib <- load (fromFilePath fp)
                               readPandocBiblio readerSettings csl bib i
                           else
                               readPandocWith readerSettings i
        writePandoc' = return . writePandocWith writerSettings

    getResourceBody 
        >>= withItemBody (unixFilter "pandoc" [ "-F"
                                            , "pandoc-crossref"
                                            , "-F"
                                            , "pandoc-sidenote"
                                            , "-t"
                                            , "markdown"
                                            , "-M"
                                            , "crossrefYaml=pandoc-crossref.yaml"
                                            ])
        >>= readPandoc'
        >>= traverse (renderFormulae (formulaSettings pr))
        >>= writePandoc'
                                            
postCtx :: Context String
postCtx =
    dateField "date" "%B %e, %Y" `mappend`
    defaultContext
