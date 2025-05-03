/**
 * Patch Solid JS bundle to make it compatible with ssr.
 * This script adds
 *   `if (typeof window === 'undefined') {
 *     return null;
 *   }`
 *  to the `template$1` function which is called after file import because of Solid JS optimisation.
 */


const fs = require('fs');
const path = require('path');

const esm_template$1 = `function template$1(html, check, isSVG) {
  const t2 = document.createElement("template");
  t2.innerHTML = html;
  let node = t2.content.firstChild;
  if (isSVG)
    node = node.firstChild;
  return node;
}`;

const esm_template$1_target = `function template$1(html, check, isSVG) {
  if (typeof window === 'undefined') {
    return null;
  }

  const t2 = document.createElement("template");
  t2.innerHTML = html;
  let node = t2.content.firstChild;
  if (isSVG)
    node = node.firstChild;
  return node;
}`;

const cjs_template$1 = `function template$1(html, check, isSVG) {
  const t2 = document.createElement("template");
  t2.innerHTML = html;
  let node = t2.content.firstChild;
  if (isSVG)
    node = node.firstChild;
  return node;
}`;

const cjs_template$1_target = `function template$1(html, check, isSVG) {
  if (typeof window === 'undefined') {
    return null;
  }

  const t2 = document.createElement("template");
  t2.innerHTML = html;
  let node = t2.content.firstChild;
  if (isSVG)
    node = node.firstChild;
  return node;
}`;

const esm_path = path.resolve(process.cwd(), './lib/index.mjs');
const cjs_path = path.resolve(process.cwd(), './lib/index.cjs');

patchBuild(esm_path, esm_template$1, esm_template$1_target);
patchBuild(cjs_path, cjs_template$1, cjs_template$1_target);

console.log('\nPatching build for ssr completed');


function patchBuild(path, template, template_target) {
    let fileContent = fs.readFileSync(path).toString();
    if (!fileContent.includes(template)) {
        throw new Error(`[UI_BUILD_FAILED] File ${path} doesn\'t include template$1 function`);
    }

    fileContent = fileContent.replace(template, template_target);

    fs.writeFileSync(path, fileContent);
}
