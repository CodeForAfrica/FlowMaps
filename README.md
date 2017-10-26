# Flow maps

Flow maps shows movement between geographical areas over time. The default map is a world map that can show movement between countries, but this map can be replaced by other maps to produce movements on different scales at any location.


## Usage

```html
<div class="flow-map" data-start-year="1990" data-end-year="2005" data-year-gap="5" data-bg-color="#192A3A" data-sending-color="#7E4C7F" data-receiving-color="#23787A" data-title="Title of the Map" data-description="Description goes here" data-sending-text="Sending" data-receiving-text="Receiving" data-text-color="#EFEFEF" data-show-social="true" data-overlay-text-post=" people"></div>
<script src="https://cdn.jsdelivr.net/gh/CodeForAfrica/FlowMaps@1.0/dist/javascript/flow-map.min.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/CodeForAfrica/FlowMaps@1.0/dist/css/index.css" />
```

## API Reference

Flow maps uses [data attributes](https://developer.mozilla.org/en/docs/Web/Guide/HTML/Using_data_attributes) to personalise the visualisation. 

### data-start-year [required]

#### Description

The first year for which data is present

### data-end-year [required]

#### Description

The last year for which data is present

### data-year-gap [optional]

#### Description

The number of years between each dataset. Default: 1

