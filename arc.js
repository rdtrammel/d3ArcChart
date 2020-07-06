function ArcChart(targetEl, opts) {
    return {
        targetEl: targetEl || document.body,
        data: opts.data || {},
        margin: {
            top: opts.marginTop || 20,
            right: opts.marginRight || 30,
            bottom: opts.marginBottom || 20,
            left: opts.marginLeft || 30
        },
        width: opts.width || 450,
        height: opts.height || 300,
        stroke: {
            color: opts.strokeColor || "black",
            weight: opts.strokeWeight || 1
        },
        render: function () {
            // append the svg object to the body of the page
            var svg = d3.select("#my_dataviz")
                .append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + this.margin.left + "," + this.margin.top + ")");

            var data = this.data;
            //console.log(data);

            // List of node names
            var allNodes = this.data.nodes.map(function (d) {
                return d.name
            });
            //console.log(allNodes);

            // A linear scale to position the nodes on the X axis
            var x = d3.scalePoint()
                .range([0, this.width])
                .domain(allNodes)

            // Add the circle for the nodes
            var nodes = svg
                .selectAll("mynodes")
                .data(this.data.nodes)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return (x(d.name))
                })
                .attr("cy", this.height - this.margin.top)
                .attr("r", 8)
                .style("fill", "#69b3a2")

            // And give them a label
            var labels = svg
                .selectAll("mylabels")
                .data(this.data.nodes)
                .enter()
                .append("text")
                .attr("x", function (d) { return (x(d.name)) })
                .attr("y", this.height - 10)
                .text(function (d) { return (d.name) })
                .style("text-anchor", "middle")

            // Add links between nodes. Here is the tricky part.
            // In my input data, links are provided between nodes -id-, NOT between node names.
            // So I have to do a link between this id and the name
            var idToNode = {};
            data.nodes.forEach(function (n) {
                idToNode[n.id] = n;
            });
            // Cool, now if I do idToNode["2"].name I've got the name of the node with id 2

            // Add the links
            var links = svg
                .selectAll('mylinks')
                .data(this.data.links)
                .enter()
                .append('path')
                .attr('d', function (d) {
                    start = x(idToNode[d.source].name) // X position of start node on the X axis
                    end = x(idToNode[d.target].name) // X position of end node
                    return ['M', start, this.height - this.margin.top, // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                            'A', // This means we're gonna build an elliptical arc
                            (start - end) / 2, ',', // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
                            (start - end) / 2, 0, 0, ',',
                            start < end ? 1 : 0, end, ',', this.height - this.margin.top
                        ] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                        .join(' ');
                })
                .style("fill", "none")
                .attr("stroke", "black")

            // Add the highlighting functionality
            nodes
                .on('mouseover', function (d) {
                    // Highlight the nodes: every node is green except of him
                    nodes.style('fill', "#B8B8B8")
                    d3.select(this).style('fill', '#69b3b2')
                    // Highlight the connections
                    links
                        .style('stroke', function (link_d) {
                            return link_d.source === d.id || link_d.target === d.id ? '#69b3b2' : '#b8b8b8';
                        })
                        .style('stroke-width', function (link_d) {
                            return link_d.source === d.id || link_d.target === d.id ? 4 : 1;
                        })
                })
                .on('mouseout', function (d) {
                    nodes.style('fill', "#69b3a2")
                    links
                        .style('stroke', 'black')
                        .style('stroke-width', '1')
                })

            // text hover nodes
            svg
                .append("text")
                .attr("text-anchor", "middle")
                .style("fill", "#B8B8B8")
                .style("font-size", "17px")
                .attr("x", 50)
                .attr("y", 10)
                .html("Hover nodes")
        }
    }
}