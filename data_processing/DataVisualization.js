const fs = require('fs');
const readline = require('readline');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 800;
const height = 600;
const chartCallback = (ChartJS) => {
    ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

async function readSensorData(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const data = [];
    for await (const line of rl) {
        const [sensor_id, temperature, humidity, timestamp] = line.split(' ').map(val => parseFloat(val));
        data.push({ sensor_id, temperature, humidity, timestamp });
    }
    return data;
}

async function generateChart(data) {
    const temperatures = data.map(d => d.temperature);
    const humidity = data.map(d => d.humidity);
    const labels = data.map(d => new Date(d.timestamp * 1000).toLocaleTimeString());

    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°F)',
                data: temperatures,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false
            },
            {
                label: 'Humidity',
                data: humidity,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'minute'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Time'
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync('chart.png', image);
}

(async () => {
    const data = await readSensorData('transformed_sensor_data.txt');
    await generateChart(data);
    console.log('Chart generated and saved as chart.png');
})();
