# Peaks of Hong Kong

**UPDATE ON JUL 2021**: I am rewriting this web map application. The new version of this app is now in the following link.

<p align="center">
  <a href="https://github.com/KHwong12/viewshed-peaks">
    https://github.com/KHwong12/viewshed-peaks
  </a>
</p>

<br>
<br>
<br>
<br>
<br>
<br>


[CHECK THE WEB APPLICATION](https://khwong12.github.io/HK_Peaks/)

A web map application for investigating area visible from the peaks of Hong Kong

## Feature Highlights

This web map stands out other web map in terms of:

- Compute visible area on map directly
- Check the location of the peaks
- No similar web application in Hong Kong

## Overview

> How much of the city you can see from the peaks?

This project is an interactive 3d web map for viewers to explore where they can see from the peaks of Hong Kong. The web map calculate the visible area ([viewshed](https://en.wikipedia.org/wiki/Viewshed)) from any point the user clicked on the map.

In addition, the user can select their own visible range when computing the viewshed so as to imitate the visible range during different weather. The current visibility are also available in the webpage for users' reference (data provided by API of Hong Kong Observatory).

## Example Usage

![overview](img/HKPeaks_Overview.png)
Overview of the web map
&nbsp;

![view](img/HKPeaks_move.gif)
Example usage of the map to drag and view the topography of the hill, as well as zoom to the designated spots

&nbsp;

![viewshed](img/HKPeaks_viewshed.gif)
Example usage of performing a viewshed analysis, allowing users to view the visible area from the peaks

## How to Use

1. Drag and wander around the 3D map and investigate the topography.
2. Click on the peaks (or any other places you like). A red pin will appear on the place you clicked.
3. The application will then compute the visible area (viewshed in jargon) from that point. The white grids appears on the map shows the area visible from the centre.
4. Drag the slider to set your desired visibility (1-20km) to simulate how far you can see from the centre.

<!-- ## Motivation

How this web map stands out from others? -->

## Issues

Known Issues:

- Attributes missing in some Peaks
  - Problem of raw data downloaded from OpenStreetMap
- Viewshed cannot be executed
  - Unknown error related to [viewshed function](https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed) in ArcGIS REST service. Tested with same query parameters could result in pass/fail at different times
  - **Further Investigation Required**

## Possible New Features

TODO: Features to be Fixed/Changed/Added/Removed

## Licensing

TODO
