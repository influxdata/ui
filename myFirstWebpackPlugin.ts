const fs = require('fs')

class MyFirstWebpackPlugin {
    apply(compiler) {
        compiler.hooks.done.tapAsync("MyFirstWebpackPlugin", (stats, cb) => {

            fs.writeFileSync('stats.json',stats)
            cb();
        })
    }
}

module.exports = MyFirstWebpackPlugin;