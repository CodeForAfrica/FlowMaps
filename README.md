# Flow maps

Flow maps shows bilateral movement between geographical areas over time. The default map is a world map that can show movement between countries, but this map can be replaced by other maps to produce movements on different scales at any location.


## Usage

```html
<div class="flow-map" data-start-year="1990" data-end-year="2005" data-year-gap="5" data-bg-color="#192A3A" data-sending-color="#7E4C7F" data-receiving-color="#23787A" data-title="Title of the Map" data-description="Description goes here" data-sending-text="Sending" data-receiving-text="Receiving" data-text-color="#EFEFEF" data-map-color="#EFEFEF" data-show-social="true" data-overlay-text-post=" people"></div>
<script src="https://cdn.jsdelivr.net/gh/CodeForAfrica/FlowMaps@1.0/dist/javascript/flow-map.min.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/CodeForAfrica/FlowMaps@1.0/dist/css/index.css" />
```

![flow-maps-screenshot](https://user-images.githubusercontent.com/1282239/32061950-00a8a00c-ba6b-11e7-8a04-f034aab41007.png)

## API Reference

By default a world map will be displayed. To change this, link to an external TopoJSON file or overwrite the file at `/data/topojson.json` (see [data-topojson](#topojson) for more information). To add your dataset link to an external csv file or overwrite the file at `/data/data.csv` (see [data-data](#data) for more information). 

Flow maps uses [data attributes](https://developer.mozilla.org/en/docs/Web/Guide/HTML/Using_data_attributes) to personalise the visualisation. 

### data-start-year [required]

#### Description

The first year for which data is present

### data-end-year [required]

#### Description

The last year for which data is present

### data-title [required]

#### Description

Title for the map

### data-description [required]

#### Description

Description for the map

### data-year-gap [optional]

#### Description

The number of years between each dataset. Default: 1

### data-bg-color [optional]

#### Description

Background colour for the map. Default: '#192A3A'

### data-text-color [optional]

#### Description

Text colour for the title, description, switch and social menu. Default: '#EFEFEF'

### data-map-color [optional]

#### Description

Color for the map. Default: '#EFEFEF'

### data-sending-color [optional]

#### Description

Sending colour for the map. Default: '#7E4C7F'

### data-receiving-color [optional]

#### Description

Receiving colour for the map. Default: '#23787A'

### data-sending-text [optional]

#### Description

Label for "sending" direction switch option. Default: 'Sending'

### data-receiving-text [optional]

#### Description

Label for "receiving" direction switch option. Default: 'Receiving'

### data-show-social [optional]

#### Description

Whether or not to show the social menu. If set to true, the icons will populate the share content based on the og/meta tags in your website's `<head>` tag. Default: false

### data-overlay-text-pre [optional]

#### Description

Text to appear on the overlay before the number, e.g. '£'. Default: ''

### data-overlay-text-post [optional]

#### Description

Text to appear on the overlay after the number, e.g. ' people'. Default: ''

### data-ratio [optional]

#### Description

A number to describe the ratio of map width to map height. For a full view of the world map this should always be the default 2.3415. Default: 2.3415

### data-zoom [optional]

#### Description

Magnification factor to display a zoomed map. Default: 1

### data-zoom-x [optional]

#### Description

X position of the centre of zoom. Default: '50%'

### data-zoom-y [optional]

#### Description

Y position of the centre of zoom. Default: '50%'

### data-topojson<a name="topojson"></a> [optional]

#### Description

Link to an external TopoJSON file defining the map to be displayed. By default the world map will be displayed. You can also change the TopoJSON file by simply replacing the file in `/data/topojson.json`. The TopoJSON file must be valid TopoJSON and have exactly one geometry object named `subunits` and with type `GeometryCollection`.

### data-data<a name="data"></a> [optional]

#### Description

Link to an external csv file containing the data to be visualized. By default the data will be pulled from `/data/data.csv`. You can replace this file with your own dataset. The data headings should be as follows: `year,sending_name,receiving_name,amount`.
