const e={title:"markmap-lib"},a=`<p><img src="https://img.shields.io/npm/v/markmap-lib.svg" alt="NPM"></p>
<p>Transform Markdown to data used by markmap.</p>
<h2 id="installation">Installation</h2>
<pre><code class="language-bash">$ npm install markmap-lib
</code></pre>
<h2 id="usage">Usage</h2>
<p>Parse Markdown and create a node tree, return the root node and a <code>features</code> object containing the active features during parsing.</p>
<p>Transform Markdown to markmap data:</p>
<pre><code class="language-js">import { Transformer } from &#39;markmap-lib&#39;;

const transformer = new Transformer();

// 1. transform Markdown
const { root, features } = transformer.transform(markdown);

// 2. get assets
// either get assets required by used features
const { styles, scripts } = transformer.getUsedAssets(features);

// or get all possible assets that could be used later
const { styles, scripts } = transformer.getAssets();
</code></pre>
<p>Now we have the data for rendering. See <a href="packages--markmap-view">markmap-view</a> for how to use them.</p>
`;export{e as frontmatter,a as html};
