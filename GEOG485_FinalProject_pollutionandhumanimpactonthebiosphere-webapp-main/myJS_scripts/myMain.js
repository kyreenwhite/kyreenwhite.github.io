window.onload = function () {

    function openTab(evt, tabName) {
        var tabcontent = document.getElementsByClassName("tabcontent");
        for (var i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        var tablinks = document.getElementsByClassName("tablinks");
        for (var i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }

        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.classList.add("active");
    }

    // document.getElementById("defaultOpen").click();
    // window.addEventListener('DOMContentLoaded', () => {
    //     document.getElementById("defaultOpen").click();
    //   });


    var map = L.map('mapId').setView([39.809860, -98.555183], 4);

    var emptyOverlays = {
        "Human Population": {},
        "Air Pollution Datasets": {},
        "Light Pollution Datasets": {},
        "Noise Pollution Datasets": {}
    };

    var layerControl = L.control.groupedLayers(baseMaps, emptyOverlays, {
        collapsed: false,
        groupCheckboxes: true
    })
        .addTo(map);

    map.removeControl(layerControl);

    document.getElementById('layerControlContainer').appendChild(layerControl.getContainer());

    // Hide second evil layer control box
    setTimeout(() => {
        document
            .querySelectorAll('#layerControlContainer .leaflet-control-layers')
            .forEach(ctrl => {
                // if this panel has no span whose text is "Topographic Map", it must be the phantom
                const hasTopo = Array.from(ctrl.querySelectorAll('span'))
                    .some(span => span.textContent.trim() === 'Topographic Map');
                if (!hasTopo) {
                    ctrl.remove();
                }
            });
    }, 0);

    //Basemaps 
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    var second = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    var third = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });

    var baseMaps = {
        "Street Map": osm,
        "Topographic Map": second,
        "Inverted Night Map": third
    };

    osm.addTo(map);


    //to make sure the little color boxes load
    map.on('overlayadd', () => {
        Object.entries(overlayColors).forEach(([layerName, color]) => {
            addColorBox(layerName, color);
        });
    });

    // 1) You create & append the control:
    // var layerControl = L.control.groupedLayers(baseMaps, emptyOverlays, opts).addTo(map);

    var layerNameMap = new Map();

    // 1) Define each layer’s gradient stops and unit label
    var gradientInfo = {
        "Human Population Density": {
            gradient: { 0: '#F2E6FF', 0.2: '#D9B3FF', 0.4: '#B380FF', 0.6: '#8C00FF', 0.8: '#6600CC', 1.0: '#3A0066' },
            unit: 'persons / mi²'
        },
        "Air Pollution": {
            gradient: { 0: '#F5EFE6', 0.2: '#E6D3B3', 0.4: '#CBA57A', 0.6: '#A97452', 0.8: '#7E4A28', 1.0: '#4D2C15' },
            unit: 'Days PM2.5'
        },
        "Light Pollution": {
            gradient: { 0: '#FFF5E1', 0.2: '#FFD89A', 0.4: '#FFB64D', 0.6: '#FF8C00', 0.8: '#E76F00', 1.0: '#BF4500' },
            unit: 'SQM Reading'
        },
        "Noise Pollution": {
            gradient: { 0: '#EBF5FB', 0.2: '#A9D3F0', 0.4: '#6BAED6', 0.6: '#3182BD', 0.8: '#2171B5', 1.0: '#084594' },
            unit: 'Avg. dB'
        },
        "Gray Flycatcher Population": {
            gradient: { 0: '#F7F7F7', 0.2: '#E1E1E1', 0.4: '#B3B3B3', 0.6: '#808080', 0.8: '#595959', 1.0: '#2D2D2D' },
            unit: 'RA value'
        },
        "Usnea Lichen Population": {
            gradient: { 0: '#E5F5E0', 0.4: '#A1D99B', 0.7: '#41AB5D', 1.0: '#006D2C' },
            unit: 'Occurrences'
        },
        "Firefly Population": {
            gradient: { 0: '#D9F0D3', 0.4: '#A6DBA0', 0.7: '#73C476', 1.0: '#FEEA5A' },
            unit: 'Sightings'
        }
    };

    function createLayerControls(key) {
        const item = data[key];
        const container = document.getElementById('controls');
        const block = document.createElement('div');
        block.className = 'layer-block';
        block.id = `block-${key}`;

        const title = document.createElement('h4');
        // title.innerHTML = `<input type="checkbox" id="toggle-${key}" checked /> ${item.name}`;
        block.appendChild(title);

        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.background = `linear-gradient(to right, ${item.gradient[0.0]}, ${item.gradient[0.5]}, ${item.gradient[1.0]})`;
        barContainer.appendChild(bar);


        [0, 0.25, 0.5, 0.75, 1].forEach(p => {
            const tick = document.createElement('div');
            tick.className = 'tick';
            tick.style.left = `${p * 100}%`;
            barContainer.appendChild(tick);
        });


        block.appendChild(barContainer);

        const labels = document.createElement('div');
        labels.className = 'labels';
        [0, 0.25, 0.5, 0.75, 1].forEach(p => {
            const span = document.createElement('span');
            span.textContent = p.toFixed(2);
            labels.appendChild(span);
        });
        block.appendChild(labels);

        const colorControls = document.createElement('div');
        colorControls.className = 'control-group';
        colorControls.innerHTML = `
          <label>Low</label><input type="color" value="${item.gradient[0.0]}" id="low-${key}">
          <label>Mid</label><input type="color" value="${item.gradient[0.5]}" id="mid-${key}">
          <label>High</label><input type="color" value="${item.gradient[1.0]}" id="high-${key}">
        `;
        block.appendChild(colorControls);

        const opacityControls = document.createElement('div');
        opacityControls.className = 'control-group';
        opacityControls.innerHTML = `
          <label>Opacity</label>
          <input type="range" id="opacity-${key}" min="0" max="1" step="0.01" value="1">
          <span id="opacity-value-${key}">1.00</span>
        `;
        block.appendChild(opacityControls);

        container.appendChild(block);

        item.layer = L.heatLayer(item.data[0], {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: item.gradient
        }).addTo(map);

        ['low', 'mid', 'high'].forEach(type => {
            document.getElementById(`${type}-${key}`).addEventListener('input', () => {
                const newGrad = {
                    0.0: document.getElementById(`low-${key}`).value,
                    0.5: document.getElementById(`mid-${key}`).value,
                    1.0: document.getElementById(`high-${key}`).value
                };
                item.gradient = newGrad;
                item.layer.setOptions({ gradient: newGrad });
                bar.style.background = `linear-gradient(to right, ${newGrad[0.0]}, ${newGrad[0.5]}, ${newGrad[1.0]})`;
            });
        });
    }

    var layerControl = L.control.groupedLayers(baseMaps, emptyOverlays, {
        collapsed: false,
        groupCheckboxes: true
    }).addTo(map);

    document
        .getElementById('layerControlContainer')
        .appendChild(layerControl.getContainer());


    var overlayColors = {
        "Human Population Density": "#3A0066",
        "Air Pollution": "#6F4E37",
        "Light Pollution": "#FFB000",
        "Noise Pollution": "#0000FF",
        "Gray Flycatcher Population": "#808080",
        "Usnea Lichen Population": "#7A942E",
        "Firefly Population": "#FEEA5A"
    };

    // Helper function to add color boxes next to layer labels
    function addColorBox(layerName, color) {
        setTimeout(() => {
            const labels = document.querySelectorAll('#layerControlContainer label');
            labels.forEach(label => {
                if (label.textContent.trim() === layerName && !label.querySelector('.color-box')) {
                    const box = document.createElement('span');
                    box.className = 'color-box';
                    box.style.display = 'inline-block';
                    box.style.width = '12px';
                    box.style.height = '12px';
                    box.style.backgroundColor = color;
                    box.style.marginLeft = '6px';
                    box.style.border = '1px solid #aaa';
                    box.style.verticalAlign = 'middle';
                    label.appendChild(box);
                }
            });
        }, 200); // Slight delay to ensure label is rendered
    }


    function renderAllSwatches() {
        Object.entries(overlayColors).forEach(([layerName, color]) =>
            addColorBox(layerName, color)
        );
    }
    //let's see 
    var overlayPromises = [];


    // ----- Layers and overlays below -----
    //
    //

    // Noise Pollution
    function calculateNoiseMetric(props) {
        const totalPixels = props.cvrg_ll;
        const weightedSum =
            (45 * props.cv_4050) +
            (55 * props.cv_5060) +
            (65 * props.cv_6070) +
            (75 * props.cv_7080) +
            (85 * props.cv_8090) +
            (95 * props.cvrg_90);
        return totalPixels ? (weightedSum / totalPixels) : 0;
    }

    // Noise Pollution (two-part GeoJSON merge)
    Promise.all([
        fetch('data/tractresultUS_part1.geojson').then(r => r.json()),
        fetch('data/tractresultUS_part2.geojson').then(r => r.json())
    ])
        .then(([part1, part2]) => {
            // 1) Merge the two FeatureCollections
            const combined = {
                type: "FeatureCollection",
                features: part1.features.concat(part2.features)
            };

            // 2) Build heat-data as before
            const pts = combined.features.map(f => {
                const avgDb = calculateNoiseMetric(f.properties);
                const [lng, lat] = turf.centroid(f).geometry.coordinates;
                return [lat, lng, avgDb];
            });
            const maxDb = Math.max(...pts.map(p => p[2]));
            const heatData = pts.map(p => [p[0], p[1], p[2] / maxDb]);

            // 3) Create the layer and register it
            const noiseHeat = L.heatLayer(heatData, {
                radius: 10,
                blur: 15,
                maxZoom: 6,
                gradient: {
                    0.0: '#EBF5FB',
                    0.2: '#A9D3F0',
                    0.4: '#6BAED6',
                    0.6: '#3182BD',
                    0.8: '#2171B5',
                    1.0: '#084594'
                }
            });

            layerControl.addOverlay(noiseHeat, "Noise Pollution", "Noise Pollution Datasets");
            layerNameMap.set(noiseHeat, "Noise Pollution");
            renderAllSwatches();
        })
        .catch(err => console.error("Error loading noise tracts (parts):", err));

    // Gray Flycatcher Population
    function getBirdColor(ra) {
        return ra > 5 ? '#F7F7F7' :
            ra > 4 ? '#E1E1E1' :
                ra > 3 ? '#B3B3B3' :
                    ra > 2 ? '#808080' :
                        ra > 1 ? '#595959' :
                            '#2D2D2D';
    }

    function styleBird(feature) {
        const ra = feature.properties.RASTAT;
        return {
            fillColor: getBirdColor(ra),
            weight: 0.1,
            color: 'white',
            fillOpacity: 0.8
        };
    }

    overlayPromises.push(
        fetch('data/birdDensity.geojson')
            .then(res => res.json())
            .then(data => {
                var birdChor = L.geoJson(data, {
                    style: styleBird,
                    onEachFeature: (feat, layer) => {
                        layer.bindPopup(`RA: ${feat.properties.RASTAT}`);
                    }
                });
                layerControl.addOverlay(birdChor, "Gray Flycatcher Population", "Noise Pollution Datasets");
                layerNameMap.set(birdChor, "Gray Flycatcher Population");
                renderAllSwatches();
                // setTimeout(() => addColorBox("Gray Flycatcher Population", '#2D2D2D'), 500);
            })
    );

    // Human Population
    overlayPromises.push(
        fetch('data/uscitypopdensity_latlong.csv')
            .then(response => response.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        var heatData = results.data.map(row => {
                            var lat = parseFloat(row['Latitude']);
                            var lon = parseFloat(row['Longitude']);
                            var intensity = parseFloat(row['Population Density (Persons/Square Mile)']);
                            if (!isNaN(lat) && !isNaN(lon) && !isNaN(intensity)) {
                                return [lat, lon, intensity];
                            }
                        }).filter(Boolean);

                        var popHeat = L.heatLayer(heatData, {
                            radius: 18,
                            blur: 23,
                            maxZoom: 14,
                            gradient: {
                                0.0: '#F2E6FF',
                                0.2: '#D9B3FF',
                                0.4: '#B380FF',
                                0.6: '#8C00FF',
                                0.8: '#6600CC',
                                1.0: '#3A0066'
                            }
                        });
                        layerControl.addOverlay(popHeat, "Human Population Density", "Human Population");
                        layerNameMap.set(popHeat, "Human Population Density");
                        popHeat.addTo(map);
                        renderAllSwatches();
                        // setTimeout(() => addColorBox("Human Population Density", '#3A0066'), 500);

                    }
                });
            })
    );

    // Air Pollution
    overlayPromises.push(
        fetch('data/annual_aqi_by_county_2024.csv')
            .then(res => res.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        var heatData = results.data.map(row => {
                            var lat = parseFloat(row['Latitude']);
                            var lon = parseFloat(row['Longitude']);
                            var intensity = parseFloat(row['Days PM2.5']);
                            return (!isNaN(lat) && !isNaN(lon) && !isNaN(intensity)) ? [lat, lon, intensity] : null;
                        }).filter(Boolean);

                        var airHeat = L.heatLayer(heatData, {
                            radius: 18,
                            blur: 23,
                            maxZoom: 14,
                            gradient: {
                                0.0: '#F5EFE6',
                                0.2: '#E6D3B3',
                                0.4: '#CBA57A',
                                0.6: '#A97452',
                                0.8: '#7E4A28',
                                1.0: '#4D2C15'
                            }
                        });
                        layerControl.addOverlay(airHeat, "Air Pollution", "Air Pollution Datasets");
                        layerNameMap.set(airHeat, "Air Pollution");
                        renderAllSwatches();
                        // airHeat.addTo(map);
                        // setTimeout(() => addColorBox("Air Pollution", '#BF4500'), 500);
                    }
                });
            })
    );

    // Usnea Lichen Population
    overlayPromises.push(
        fetch('data/usneaOccurances.csv')
            .then(res => res.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: results => {
                        const heatPoints = results.data
                            .map(r => {
                                const lat = parseFloat(r.decimalLatitude);
                                const lng = parseFloat(r.decimalLongitude);
                                return (!isNaN(lat) && !isNaN(lng)) ? [lat, lng, 1] : null;
                            }).filter(Boolean);

                        var lichenHeat = L.heatLayer(heatPoints, {
                            radius: 10,
                            blur: 15,
                            maxZoom: 6,
                            gradient: {
                                0.0: '#E5F5E0',
                                0.4: '#A1D99B',
                                0.7: '#41AB5D',
                                1.0: '#006D2C'
                            }
                        });
                        layerControl.addOverlay(lichenHeat, "Usnea Lichen Population", "Air Pollution Datasets");
                        layerNameMap.set(lichenHeat, "Usnea Lichen Population");
                        renderAllSwatches();
                        // lichenHeat.addTo(map);
                        // setTimeout(() => addColorBox("Usnea Lichen Population", '#7A942E'), 500);
                    }
                });
            })
    );

    // Light Pollution
    overlayPromises.push(
        fetch('data/lightData.csv')
            .then(res => res.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: ({ data }) => {
                        const raw = data.map(r => {
                            const lat = parseFloat(r.Latitude);
                            const lon = parseFloat(r.Longitude);
                            const val = parseFloat(r.SQMReading);
                            return (!isNaN(lat) && !isNaN(lon) && !isNaN(val)) ? [lat, lon, val] : null;
                        }).filter(Boolean);

                        const heatData = raw.map(([lat, lon, v]) => {
                            const t = Math.min(1, Math.max(0, (v - 0) / 10));
                            return [lat, lon, t];
                        });

                        const lightHeat = L.heatLayer(heatData, {
                            radius: 20,
                            blur: 15,
                            maxZoom: 6,
                            gradient: {
                                0.0: '#FFF5E1',
                                0.2: '#FFD89A',
                                0.4: '#FFB64D',
                                0.6: '#FF8C00',
                                0.8: '#E76F00',
                                1.0: '#BF4500'
                            }
                        });
                        layerControl.addOverlay(lightHeat, "Light Pollution", "Light Pollution Datasets");
                        layerNameMap.set(lightHeat, "Light Pollution");
                        renderAllSwatches();
                        // lightHeat.addTo(map);
                        // setTimeout(() => addColorBox("Light Pollution", '#FFB000'), 500);

                    }
                });
            })
    );

    // Firefly Population
    overlayPromises.push(
        fetch('data/fireflyData.csv')
            .then(res => res.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: results => {
                        const heatPoints = results.data.map(r => {
                            const lat = parseFloat(r.decimalLatitude);
                            const lng = parseFloat(r.decimalLongitude);
                            return (!isNaN(lat) && !isNaN(lng)) ? [lat, lng, 1] : null;
                        }).filter(Boolean);

                        var fireflyHeat = L.heatLayer(heatPoints, {
                            radius: 10,
                            blur: 15,
                            maxZoom: 6,
                            gradient: {
                                0.0: '#D9F0D3',
                                0.4: '#A6DBA0',
                                0.7: '#73C476',
                                1.0: '#FEEA5A'
                            }
                        });
                        layerControl.addOverlay(fireflyHeat, "Firefly Population", "Light Pollution Datasets");
                        layerNameMap.set(fireflyHeat, "Firefly Population");
                        renderAllSwatches();
                        // fireflyHeat.addTo(map);
                        // setTimeout(() => addColorBox("Firefly Population", '#FEEA5A'), 500);

                    }
                });
            })
    );

    //Add color swatches!
    Promise.all(overlayPromises).then(() => {
        Object.entries(overlayColors).forEach(([name, color]) =>
            addColorBox(name, color)
        );
    });


}
