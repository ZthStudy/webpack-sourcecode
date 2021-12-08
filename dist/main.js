(function(graph){
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

      require('./src/index.js')
    })({"./src/index.js":{"dependecies":{"./tiantian.js":"./src\\tiantian.js","./yaya.js":"./src\\yaya.js"},"code":"\"use strict\";\n\nvar _tiantian = require(\"./tiantian.js\");\n\nvar _yaya = require(\"./yaya.js\");\n\nconsole.log(\"\".concat(_tiantian.name, \" \").concat(_yaya.word));"},"./src\\tiantian.js":{"dependecies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.name = void 0;\nvar name = \"tiantian\";\nexports.name = name;"},"./src\\yaya.js":{"dependecies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.word = void 0;\nvar word = \"love yaya\";\nexports.word = word;"}})