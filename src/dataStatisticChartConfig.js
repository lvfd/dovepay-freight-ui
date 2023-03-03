const color = {
  blue: 'rgb(3, 78, 162)',
  yellow: 'rgb(250, 166, 26)',
}
const legendLabel = '金额'

const type = 'bar'
const options = {
  layout: {
    padding: 20
  }
}

export default function(res) {
  const axisData = getAxisData(res)
  return {
    type: type,
    data: getData(axisData),
    options: options,
  }
}

function getAxisData(res) {
  try {
    const data = res.data
    let axisData = []
    data.forEach((line) => {
      let object = {}
      object.label = line.billTime
      object.index = line.totalAmount
      axisData.push(object)
    })
    axisData.sort((firstItem, secondItem) => 
      parseInt(firstItem.label) - parseInt(secondItem.label))
    return axisData
  } catch(e) {
    console.error(e.stack)
  }
}

function getData(data) {
  
  return {
    labels: getLabels(data),
    datasets: [{
      data: getIndex(data),
      label: legendLabel,
      backgroundColor: color.blue,
      borderColor: color.blue,
      maxBarThickness: 100,
    }]
  }

  function getLabels(data) {
    let array = []
    data.forEach((line) => {
      array.push(line.label)
    })
    return array
  }

  function getIndex(data) {
    let array = []
    data.forEach((line) => {
      array.push(line.index)
    })
    return array
  }
  
}