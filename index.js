const homedir = require('os').homedir()
const home = process.env.HOME || homedir
const p = require('path')
const dbPath = p.join(home, '.todo')
const fs = require('fs')
const db = require('./db.js')
const inquirer = require('inquirer');

module.exports.add = async(title) => {
  //读取之前的任务
  const list = await db.read()
  //往任务里添加title
  list.push({title:title,done:false})
  //存储任务到文件
  db.write(list)
}

module.exports.clear = async(title) => {
  await db.write([])
}

module.exports.showAll = async() => {
  //读取之前的任务
  const list = await db.read()
  //打印之前的任务
  list.forEach((task, index) => {
    console.log(`${task.done ? '[x]' : '[_]'} ${index+1} - ${task.title}`)
  })
  inquirer
  .prompt(
    {
      type: 'list',
      name: 'index',
      message: '请选择你想要操作的任务',
      choices: [{name: '退出' , index : '-1'}, ...list.map((task, index) => {
        return {name: `${task.done ? '[x]' : '[_]'} ${index+1} - ${task.title}`, value: index.toString()}
      }), {name: '+ 创建任务', value: '-2'}]
    },
  )
  .then((answer) => {
    const index = parseInt(answer.index)
    if(index >= 0){
      //选中一个任务
      inquirer.prompt({
        type: 'list',
        name: 'action',
        message: '请选择操作',
        choices: [
          {name: '退出', value: 'quit'},
          {name: '已完成', value: 'markAsDone'},
          {name: '未完成', value: 'markAsUnDone'},
          {name: '改标题', value: 'updateTitle'},
          {name: '删除', value: 'remove'}
        ]
      }).then((answer) => {
        switch(answer.action){
          case 'markAsDone':
            list[index].done = true;
            db.write(list)
            break;
          case 'markAsUnDone':
            list[index].done = true;
            db.write(false)
            break;
          case 'updateTitle':
            inquirer.prompt({
              type: 'input',
              name: 'title',
              message: "新的标题",
              default: list[index].title
            }).then((answer) => {
              list[index].title = answer.title
              db.write(list)
            });
            break;
          case 'remove':
            list.splice(index, 1)
            db.write(list)
            break;
        }
      })
    }else if(index === -2){
      //创建任务
      inquirer.prompt({
        type: 'input',
        name: 'title',
        message: "输入任务标题",
      }).then(answer => {
        list.push({
          title: answer.title,
          done: false
        })
      })
    }
  });

}