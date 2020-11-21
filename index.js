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

function markAsDone(list, index) {
  list[index].done = true;
  db.write(list)
}

function markAsUnDone(list, index) {
  list[index].done = true;
  db.write(false)
}

function updateTitle(list, index) {
  inquirer.prompt({
    type: 'input',
    name: 'title',
    message: "新的标题",
    default: list[index].title
  }).then((answer) => {
    list[index].title = answer.title
    db.write(list)
  });
}

function remove(list, index) {
  list.splice(index, 1)
  db.write(list)
}

function askforAction(list, index) {
  const actions = {
    markAsDone,
    markAsUnDone,
    remove,
    updateTitle
  };
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
    const action = actions[answer.action]
    action && action(list, index)
    // switch(answer.action){
    //   case 'markAsDone':
    //     markAsDone(list, index)
    //     break;
    //   case 'markAsUnDone':
    //     markAsUnDone(list, index)
    //     break;
    //   case 'updateTitle':
    //     updateTitle(list, index)
    //     break;
    //   case 'remove':
    //     remove(list, index)
    //     break;
    // }
  })
}

function askForCreateTask(list) {
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

function printTasks(list) {
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
      //askforAction
      askforAction(list, index)
    }else if(index === -2){
      //创建任务
      askForCreateTask(list)
    }
  });
}

module.exports.showAll = async() => {
  //读取之前的任务
  const list = await db.read()
  //打印之前的任务
  printTasks(list)
}