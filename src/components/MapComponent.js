'use client';
import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import View from "ol/View.js";
import XYZ from "ol/source/XYZ.js";
import { GeoJSON } from "ol/format.js";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import pointFeatures from "@/util/features.json";
import DataVisualization from "./DataVisualization";

const MapComponent = () => {
  // set ref on different popup elements to access them
  const popupContainerRef = useRef(null);
  const popupCloserRef = useRef(null);
  const popupContentRef = useRef(null);
  // using state variable to manage the data location based on feature click
  const [location, setLocation] = useState(null)

  useEffect(() => {
    // on component mount create a OpenLayers map with two layers

    // set features to be displayed in the vectorLayer
    const features = new GeoJSON().readFeatures(pointFeatures);
    features.forEach((feature) => {
      feature.set("cursor", "pointer");
    });

    // OpenLayers map with a maptiler streets tileLayer and a vetorLayer to show mark each state and UT of Bharat
    const mapInstance = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            attributions:
              '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
              '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            url:
              "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=" +
              process.env.NEXT_PUBLIC_MAPTILER_API_KEY, // get your own api key at maptiler.com
            tileSize: 512,          
          }),
        }),
        new VectorLayer({
          source: new VectorSource({
            features,
          }),
          style: new Style({
            image: new Circle({
              radius: 6,
              fill: new Fill({
                color: "orange",
              }),
              stroke: new Stroke({
                color: "black",
                width: 2,
              }),
            }),
          }),
        }),
      ],
      view: new View({
        center: [79.035645, 23], // Longitude, Latitude
        zoom: 4.8,
        projection: "EPSG:4326", //WGS84 projection (because it's based on WGS84's ellipsoid)
      }),
    });

    // creating an overLay to show the popup on.
    const popupOverlay = new Overlay({
      element: popupContainerRef.current,
      autoPan: {
        animation: {
          duration: 250, // smooth operator
        },
      },
    });

    // create a handler to close the popup 
    popupCloserRef.current.onclick = function () {
      popupOverlay.setPosition(undefined);
      popupCloserRef.current.blur();
      return false;
    };

    // add popup to map
    mapInstance.addOverlay(popupOverlay);

    // click event listner to check if clicked location has a feature on it
    mapInstance.on("singleclick", function (evt) {
      mapInstance.forEachFeatureAtPixel(evt.pixel, function (feature) {
        if (feature) {
          // if it has a feature then save the location to state variable hence create the visualisation and show the popup.          
          const coordinate = evt.coordinate;     
          setLocation(feature.get("location"));     
          popupOverlay.setPosition(coordinate);
        }
      });
    });

    // handler to change the cursor to pointer on hover of a feature on the map.
    
    mapInstance.on("pointermove", function (evt) {
      let hit = false;
      mapInstance.forEachFeatureAtPixel(evt.pixel, function (feature) {
        hit = true;
      });
      mapInstance.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    return () => {
      // on component unmount remove the map to avoid unexpected results
      mapInstance.setTarget(null);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <div id="map" className="map"></div>
      <div ref={popupContainerRef} id="popup" className="ol-popup">
        <a
          ref={popupCloserRef}
          href="#"
          id="popup-closer"
          className="ol-popup-closer"
        ></a>
        <div ref={popupContentRef} id="popup-content"><DataVisualization location={location}/></div>
      </div>
    </div>
  );
};

export default MapComponent;
