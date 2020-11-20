const { Console } = require('console')
const { fstat, readFile } = require('fs')

const homedir = require('os').homedir()
const home = process.env.HOME || homedir
const p = require('path')
const dbPath = p.join(home, '.todo')
const fs = require('fs')

module.exports.add = (title) => {
  //读取之前的任务
  const list = db.read()
  //往任务里添加title
  list.push({title:title,done:false})
  //存储任务到文件
  db.write(list)

  fs.readFile(dbPath, { flag: 'a+' }, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      let list
      try {
        list = JSON.parse(data.toString())
      } catch (err) {
        list = []
      }
      const task = {
        title: title,
        done: false
      }
      list.push(task)
      const string = JSON.stringify(list)
      console.log(string)
      fs.writeFile(dbPath, string+'\n', (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
  })
}