var m = L.map("map", { minZoom: 10, maxZoom: 11 }).setView(
  [28.5915128, 77.2192949],
  10
);
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//   minZoom: 10,
//   maxZoom:11,
//   noWrap: true,
// }).addTo(m);
var southWest = L.latLng(28.390434, 76.82135),
  northEast = L.latLng(28.893019, 77.354187);
var bounds = L.latLngBounds(southWest, northEast);

m.setMaxBounds(bounds);
//-------------------------------------------------------------------------------------------

var prevLayerClicked = null;
// let arrrr=[]
defaultStyle = { color: "black", weight: 1, fillColor: "blue", fillOpacity: 1 };
// activeStyle = { color: "black" ,fillColor:"yellow", fillOpacity: 1 }
function createLayer(theme) {
  let shpfile = new L.Shapefile(`./dist/${theme}.zip`, {
    onEachFeature: function (feature, layer) {
      layer.setStyle(defaultStyle);
      if (feature.properties) {
        layer.bindTooltip(feature.properties.Ward_Name);
        // layer.bindTooltip(feature.properties.DISTRICT);
        // console.log(feature.properties.DISTRICT)
      }
      let tr = document.createElement("tr");
      makeRequest(layer.getBounds().getCenter(),feature,tr,layer);
      layer.on({
        click: function (e) {
          // var layer = e.target;
          if (prevLayerClicked !== null) {
            // prevLayerClicked.setStyle(defaultStyle);
            prevLayerClicked.closeTooltip()
          }
          // // m.flyToBounds(e.target.getBounds());
          // layer.setStyle(activeStyle);
          prevLayerClicked = layer;
          ac = document.getElementById("active");
          if (ac) ac.id = "";
          tr.id = "active";
          tr.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });
        },
      });
    },
  });
  return shpfile;
}
let shpfile = createLayer("ward");
// let shpfile = createLayer("ward");
shpfile.addTo(m);
shpfile.once("data:loaded", function () {
  document.getElementById("load").style.display = "none";
  console.log("finished loaded shapefile");
});

function createList(feature,p) {
  // return `<h3>Name : ${feature.properties.Ward_Name}</h3><p>Number : ${feature.properties.Ward_No}</p>`;
  console.log(p)
  return `
  <td>${feature.properties.Ward_Name}</td>
  ${Object.values(p).map(e=>`<td>${e}</td>`).join('')}
  `;
}

function genPop(station) {
  return `<p>coords:${station.lat},${station.lng}</p>
  <h2 class='heading'>${station.name}</h2>
    <div id='${station.lat}'></div>
    <div class='bottom'>
    <span class='green'></span>
    <span>GOOD</span>
    <span class='yellow'></span>
    <span>MEDIUM</span>
    <span class='red'></span>
    <span>BAD</span></div>
    `;
}

// var layer = L.layerGroup();
// layer.addTo(m);
function makeRequest(station,feature,tr,layer) {
  fetch(
    `https://jtaqi.herokuapp.com/data?lat=${station.lat}&lon=${station.lng}`
  )
    .then((r) => r.json())
    .then((x) => {
      let p = x.list[0].components;
      let b = color(Math.max(p.pm10, p.pm2_5));
      layer.setStyle({ fillColor: b });

      // li.innerHTML=layer.getBounds().getCenter();
      tr.innerHTML = createList(feature,p);
      tr.addEventListener("click", () => layer.fireEvent("click"));
      document.getElementById("table").appendChild(tr);
    })
    .catch((e) => console.log(e.message));
}
function color(c) {
  if (c < 50) {
    return "green";
  }
  if (c < 100) {
    return "#70b900";
  }
  if (c < 250) {
    return "#ffeb3b";
  }
  if (c < 400) {
    return "orange";
  }
  if (c > 400) {
    return "red";
  }
}
