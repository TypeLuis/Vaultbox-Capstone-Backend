import type { RequestHandler } from "express"
import Table from "cli-table"

// table was inspired by rowdy-logger script in nodemodules
const logReq:RequestHandler =  (req, _res, next) => {
  const time = new Date();
  const table = new Table({
    head: ['Time', 'Method', 'Path']
  })

  table.push([
    time.toLocaleTimeString(),
    req.method,
    req.url
  ])
  
  console.log(table.toString());
  if (req.body) {
    console.log("Containing the data:");
    // console.log(`${JSON.stringify(req.body)}`);
    console.table(req.body)
  }
  next();
}


export default logReq