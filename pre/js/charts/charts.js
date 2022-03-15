//Desarrollo de las visualizaciones
import * as d3 from 'd3';
//import { numberWithCommas2 } from './helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage, setCustomCanvas, setChartCustomCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42', 
COLOR_ANAG_1 = '#D1834F', 
COLOR_ANAG_2 = '#BF2727', 
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0', 
COLOR_GREY_1 = '#B5ABA4', 
COLOR_GREY_2 = '#64605A', 
COLOR_OTHER_1 = '#B58753', 
COLOR_OTHER_2 = '#731854';

export function initChart(iframe) {
    //Lectura de datos
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_2/main/data/edv65_1908_2020.csv', function(error,data) {
        if (error) throw error;
        
        //Desarrollo del gráfico
        let paths;

        let margin = {top: 10, right: 10, bottom: 30, left: 30},
            width = document.getElementById('chart').clientWidth - margin.left - margin.right,
            height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

        let svg = d3.select("#chart")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        let x = d3.scaleBand()
            .domain(d3.map(data, function(d){ return d.Year; }).keys())
            .range([ 0, width ]);

        let xAxis = d3.axisBottom(x)
            .tickValues(x.domain().filter(function(d,i){ return !(i%10)}));

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, 30])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        function init() {
            svg.append("path")
                .datum(data)
                .attr('class', 'prueba')
                .attr("fill", "none")
                .attr("stroke", COLOR_PRIMARY_1)
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.Year) })
                .y(function(d) { return y(+d.Male) })
                )
        
            svg.append("path")
                .datum(data)
                .attr('class', 'prueba')
                .attr("fill", "none")
                .attr("stroke", COLOR_COMP_1)
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.Year) })
                .y(function(d) { return y(+d.Female) })
                )

            paths = svg.selectAll('.prueba');

            paths.attr("stroke-dasharray", 968 + " " + 968)
                .attr("stroke-dashoffset", 968)
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(3000);
        }

        function animateChart() {
            paths.attr("stroke-dasharray", 968 + " " + 968)
                .attr("stroke-dashoffset", 968)
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(3000);
        }

        //////
        ///// Resto - Chart
        //////
        init();

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateChart();
        });

        //////
        ///// Resto
        //////

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_salud_2_2','evolucion_esperanza_vida_65');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('evolucion_esperanza_vida_65');

        //Captura de pantalla de la visualización
        //setChartCanvas();
        setCustomCanvas();

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            //setChartCanvasImage('evolucion_esperanza_vida_65');
            setChartCustomCanvasImage('evolucion_esperanza_vida_65')
        });

        //Altura del frame
        setChartHeight(iframe);
    });
}

 