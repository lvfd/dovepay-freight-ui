import Chart from 'chart.js/auto'

export default function Canvas(selector, config) {
  if (!selector) {
    return console.error('缺少参数: ("#canvasID", {[iframeNode: DocumentIframeNode, ctx: "2d"]})')
  }
  const rootDocument = config && config.iframeNode? config.iframeNode.contentDocument: document
  const cvs = rootDocument.querySelector(selector)
  const ctx = config && config.ctx? config.ctx: '2d'
  if (!cvs) return console.error('不能初始化canvas，因为定位不到DOM')
  if (!cvs.getContext) return console.error('浏览器不支持canvas')
  this.node = cvs
  this.ctx = cvs.getContext(ctx)
  this.height = 300
  this.width = 150
  console.log('canvas初始化成功')
}

Canvas.prototype.setSize = function(ratio) {
  try {
    const canvasNode = this.node
    const parent = canvasNode.parentNode
    const parentWidth = window.getComputedStyle(parent).getPropertyValue('max-width')
    canvasNode.width = parseInt(parentWidth)
    const canvasRatio = ratio
    const canvasHeight = parseInt(canvasNode.width)*parseInt(canvasRatio[1])/parseInt(canvasRatio[0])
    canvasNode.height = canvasHeight
    this.width = canvasNode.width
    this.height = canvasNode.height
    return this
  } catch(e) {
    console.error(e.stack)
    return this
  }
}

Canvas.prototype.buildChart = function(chartjsConfig) {
  try {
    const ctx = this.ctx
    Chart.defaults.font.size = 14
    const chart = new Chart(ctx, chartjsConfig)
    this.chart = chart
    this.chartjsConfig = chartjsConfig
    console.log('Chart.js配置成功')
    return this
  } catch(e) {
    console.error(e.stack)
    return this
  }
}

// Canvas.prototype.setChartTitle = function(titleText) {
//   try {
//     const ctx = this.ctx
//     const chartTitle = titleText? titleText: '未命名图表'
//     ctx.fillText(chartTitle, 10, 50)
//     return this
//   } catch(e) {
//     console.error(e.stack)
//     return this
//   }
  
// }

// Canvas.prototype.drawXYAxis = function(config) {
//   try {
//     const ctx = this.ctx
//     const xTitle = config.xTitle
//     const yTitle = config.yTitile
//     Canvas.drawX(this, xTitle)
//     Canvas.drawY(this, yTitle)
//     this.XYAxis = {
//       xTitle: xTitle,
//       yTitle: yTitle,
//     }
//     return this
//   } catch(e) {
//     console.error(e.stack)
//     return this
//   }
// }

// Canvas.drawX = function(canvas, titleArray) {
//   const width = canvas.width
//   const titleCount = titleArray.length

// }
// Canvas.drawY = function(canvas, titleArray) {

// }