#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const program = require('commander')
const execCommand = require('./lib/exec')

const { MyGithub } = require('./lib/github')
const myGithub = new MyGithub()

const { getCloneCommand, getCommitCommand } = require('./lib/helper')

const { username, pwd } = require('./lib/config')

program.version(require('../package.json').version)

program.command('clone <project>').action(project => {
  execCommand(getCloneCommand(project, username, pwd)).then(
    stdout => {
      console.log(stdout)
    },
    stderr => {
      console.log(stderr)
    }
  )
})

program
  .command('new <project>')
  .alias('n')
  .action(project => {
    createNewProject(project)
  })

program
  .command('delete <project>')
  .alias('de')
  .action(project => {
    myGithub.deleteRepo(project)
  })

program
  .command('commit <msg> [otherMsg...]')
  .alias('cm')
  .action((msg, otherMsg) => {
    execCommand(getCommitCommand(`${msg} ${otherMsg.join(' ')}`)).then(
      stdout => {
        console.log(stdout)
      },
      stderr => {
        console.log(stderr)
      }
    )
  })

program.command('pull').action(() => {
  fs.readdir('./', (err, files) => {
    if (err) {
      console.log('error:', err)
    } else {
      execCommand(getPullCommand(files)).then(
        stdout => {
          console.log(stdout)
        },
        stderr => {
          console.log(stderr)
        }
      )
    }
  })
})

program.command('ca').action(() => {
  fs.readdir('./', (err, files) => {
    if (err) {
      console.log('error:', err)
    } else {
      execCommand(getCommitAllCommand(files)).then(
        stdout => {
          console.log(stdout)
        },
        stderr => {
          console.log(stderr)
        }
      )
    }
  })
})

program.parse(process.argv)

function createNewProject(project) {
  myGithub
    .createRepo(project)
    .then(stdout => {
      return execCommand(getCloneCommand(project, username, pwd))
    })
    .catch(err => {
      console.log('err:', err)
    })
    .then(stdout => {
      return execCommand(`cd ${project}&&npm init -y`)
    })
    .catch(err => {
      console.log('err:', err)
    })
    .then(stdout => {
      return execCommand(
        `cd ${project}&&git add .&&git commit -m "first commit"&&git push -u origin master`
      )
    })
    .catch(err => {
      console.log('err:', err)
    })
    .then(stdout => {
      console.log(stdout)
    })
    .catch(err => {
      console.log('err:', err)
    })
}
function getPullCommand(files) {
  return files
    .map((file, index) => {
      if (index < files.length && index > 0) {
        return `cd..&&cd ${file}&&git pull origin master`
      } else {
        return `cd ${file}&&git pull origin master`
      }
    })
    .join('&&')
}
function getCommitAllCommand(files) {
  return files
    .map((file, index) => {
      if (index < files.length && index > 0) {
        return `cd..&&cd ${file}&&gh cm "update"`
      } else {
        return `cd ${file}&&gh cm "update"`
      }
    })
    .join('&&')
}
