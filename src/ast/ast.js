const tokenize = require("./tokenize");
const genTAst = require("./tAst");
const transform = require("./transform");
const generate = require("./generate");
import code from "./vue.txt";

export function run() {
  const tokens = tokenize(code);
  const tAst = genTAst(tokens);
  const jsAst = transform(tAst);
  return generate(jsAst.jsCode);
}
