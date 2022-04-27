//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas3 } from '../helpers';
import { getInTooltip, getOutTooltip, positionTooltip } from '../modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C',
COLOR_COMP_1 = '#528FAD';
let tooltip = d3.select('#tooltip');

export function initChart() {
    //Lectura de datos
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_2/main/data/edv65_1908_2020.csv', function(error,data) {
        if (error) throw error;
        
        //Desarrollo del gráfico
        let paths; 
        
        let margin = {top: 10, right: 15, bottom: 20, left: 30},
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
            .range([ 0, width ])
            .padding(1);

        let xAxis = function(svg) {
            svg.call(d3.axisBottom(x).tickValues(x.domain().filter(function(d,i){ if(i == 0 || i == 25 || i == 50 || i == 75 || i == 100 || i == data.length - 1){ return d; } })));
            svg.call(function(g){g.selectAll('.tick line').remove()});
            svg.call(function(g){g.select('.domain').remove()});
        }

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    
        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, 25])
            .range([ height, 0 ]);
        
        let yAxis = function(svg) {
            svg.call(d3.axisLeft(y).ticks(5).tickFormat(function(d,i) { return numberWithCommas3(d); }));
            svg.call(function(g) {
                g.call(function(g){
                    g.selectAll('.tick line')
                        .attr('class', function(d,i) {
                            if (d == 0) {
                                return 'line-special';
                            }
                        })
                        .attr('x1', '0%')
                        .attr('x2', `${width}`)
                });
            });
        }

        svg.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        function init() {
            //Hombres
            svg.append("path")
                .datum(data)
                .attr('class', 'rect')
                .attr("fill", "none")
                .attr("stroke", COLOR_PRIMARY_1)
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.Year) })
                    .y(function(d) { return y(+d.Male) })
                )
            
            //Mujeres
            svg.append("path")
                .datum(data)
                .attr('class', 'rect')
                .attr("fill", "none")
                .attr("stroke", COLOR_COMP_1)
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.Year) })
                    .y(function(d) { return y(+d.Female) })
                )

            paths = svg.selectAll('.rect');

            paths.attr("stroke-dasharray", 1000 + " " + 1000)
                .attr("stroke-dashoffset", 1000)
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(2000);

            //Círculos para tooltip
            svg.selectAll('circles_male')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', function(d) {
                    return 'circle ' + d.Year;
                })
                .attr('cx', function(d) {
                    return x(d.Year);
                })
                .attr('cy', function(d) {
                    return y(+d.Male);
                })
                .attr('r', 3)
                .attr('stroke', 'none')
                .attr('fill', 'transparent')
                .on('mouseover', function(d,i,e) {
                    //Opacidad en círculos
                    let css = e[i].getAttribute('class').split(' ')[1];
                    let circles = svg.selectAll('.circle');                    
            
                    circles.each(function() {
                        //this.style.stroke = '0.4';
                        let split = this.getAttribute('class').split(" ")[1];
                        if(split == `${css}`) {
                            this.style.stroke = 'black';
                            this.style.strokeWidth = '1';
                        }
                    });

                    //Texto
                    let html = '<p class="chart__tooltip--title">' + d.Year + '</p>' + 
                        '<p class="chart__tooltip--text">La esperanza de vida a los 65 años para las mujeres es de <b>' + numberWithCommas3(parseFloat(d.Female)) + '</b> años; para los hombres, de <b>' + numberWithCommas3(parseFloat(d.Male)) + '</b> años</p>';
                
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let circles = svg.selectAll('.circle');
                    circles.each(function() {
                        this.style.stroke = 'none';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                });

            svg.selectAll('circles_female')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', function(d) {
                    return 'circle ' + d.Year;
                })
                .attr('cx', function(d) {
                    return x(d.Year);
                })
                .attr('cy', function(d) {
                    return y(+d.Female);
                })
                .attr('r', 3)
                .attr('stroke', 'none')
                .attr('fill', 'transparent')
                .on('mouseover', function(d,i,e) {
                    //Opacidad en círculos
                    let css = e[i].getAttribute('class').split(' ')[1];
                    let circles = svg.selectAll('.circle');                    
            
                    circles.each(function() {
                        //this.style.stroke = '0.4';
                        let split = this.getAttribute('class').split(" ")[1];
                        if(split == `${css}`) {
                            this.style.stroke = 'black';
                            this.style.strokeWidth = '1';
                        }
                    });

                    //Texto
                    let html = '<p class="chart__tooltip--title">' + d.Year + '</p>' + 
                        '<p class="chart__tooltip--text">La esperanza de vida a los 65 años para las mujeres es de <b>' + numberWithCommas3(parseFloat(d.Female)) + '</b> años; para los hombres, de <b>' + numberWithCommas3(parseFloat(d.Male)) + '</b> años</p>';
                
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let circles = svg.selectAll('.circle');
                    circles.each(function() {
                        this.style.stroke = 'none';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                });    
        }

        function animateChart() {
            paths.attr("stroke-dasharray", 1000 + " " + 1000)
                .attr("stroke-dashoffset", 1000)
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(2000);
        }

        //////
        ///// Resto - Chart
        //////
        init();

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateChart();

            setTimeout(() => {
                setChartCanvas();
            }, 4000);
        });

        //////
        ///// Resto
        //////

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_salud_2_2','evolucion_esperanza_vida_65');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('evolucion_esperanza_vida_65');

        //Captura de pantalla de la visualización
        setTimeout(() => {
            setChartCanvas();
        }, 4000);

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('evolucion_esperanza_vida_65');
        });

        //Altura del frame
        setChartHeight();
    });
}

 