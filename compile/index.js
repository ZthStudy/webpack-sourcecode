const options = require("../config");
const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const path = require("path");
const { transformFromAst } = require("@babel/core");

const Parser = {
  getAst: (path) => {
    const content = fs.readFileSync(path, "utf-8");
    return parser.parse(content, {
      sourceType: "module",
    });
  },
  getDependecies: (ast, filename) => {
    const dependencies = {};
    traverse(ast, {
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename);
        const filepath = "./" + path.join(dirname, node.source.value);
        dependencies[node.source.value] = filepath;
      },
    });
    return dependencies;
  },
  getCode: (ast) => {
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"],
    });
    return code;
  },
};

class Compile {
  constructor(options) {
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;
    this.module = [];
  }

  run() {
    const moduleInfo = this.build(this.entry);
    this.module.push(moduleInfo);
    this.module.forEach(({ dependencies }) => {
      if (dependencies) {
        for (const dependecy in dependencies) {
          this.module.push(this.build(dependencies[dependecy]));
        }
      }
    });

    const dependencyGraph = this.module.reduce(
      (graph, item) => ({
        ...graph,
        [item.filePath]: {
          dependecies: item.dependencies,
          code: item.code,
        },
      }),
      {}
    );
    this.generate(dependencyGraph);
  }

  build(filePath) {
    const { getAst, getDependecies, getCode } = Parser;
    const ast = getAst(filePath);
    const dependencies = getDependecies(ast, filePath);
    const code = getCode(ast);
    return {
      filePath,
      dependencies,
      code,
    };
  }

  generate(dependencyGraph) {
    const outputFilePath = path.join(this.output.path, this.output.filename);

    const bundle = `(function(graph){
      function require(filePath) {
        function localRequire(path){
          return require(graph[filePath].dependecies[path])
        }
        var exports = {};
        (function(require,exports,code){
          eval(code)
        })(localRequire,exports,graph[filePath].code)
        return exports;
      }

      require('${this.entry}')
    })(${JSON.stringify(dependencyGraph)})`;

    fs.writeFileSync(outputFilePath, bundle, "utf-8");
  }
}

new Compile(options).run();
