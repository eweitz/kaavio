import { filter, isEmpty, partition, reduce, toPairs } from "lodash/fp";
import * as React from "react";
import { Validator } from "collit";
import { style, getStyles } from "typestyle";
// TODO fix this kludge
window["ReactPublic"] = React;

import * as customStyle from "./drawers/styles/__bundled_dont_edit__";
import * as edgeDrawerMap from "./drawers/edges/__bundled_dont_edit__";
import * as filterDrawerMap from "./drawers/filters/__bundled_dont_edit__";
import { Icons } from "./drawers/icons/__bundled_dont_edit__";
import * as markerDrawerMap from "./drawers/markers/__bundled_dont_edit__";

import { Diagram } from "./components/Diagram";
import { PanZoom } from "./components/PanZoom";
import * as kaavioStyle from "./kaavio.style";

/**
 * Kaavio component.
 * This is the highest component in Kaavio. All states are handled here and passed down as props to other components.
 *
 * You may pass an onReady(kaavio) function to this. This will be called with the Kaavio reference when everything is
 * rendered. You can access the manipulation API via kaavio.manipulator
 */
export class Kaavio extends React.Component<any, any> {
  constructor(props) {
    super(props);

    const { hiddenEntities, highlightedEntities } = this.props;
    const searchParams = new URLSearchParams(location.search);

    // TODO reconcile query params and class props for pan/zoom settings

    let reconciledHiddenEntities;
    const hideParam = searchParams.get("hide");
    if (!isEmpty(hiddenEntities)) {
      reconciledHiddenEntities = hiddenEntities;
      if (!isEmpty(hideParam)) {
        console.warn(`Warning: "hiddenEntities" was specified by two different sources, which may or may not conflict.
		prop passed to Kaavio class:
			hiddenEntities={${JSON.stringify(hiddenEntities)}}
		URL query param:
			hide=${hideParam}
		Setting URL query params to match prop passed to Kaavio class.`);

        searchParams.set("hide", hiddenEntities.join());

        history.replaceState(
          { hiddenEntities: hiddenEntities },
          document.title,
          "?" + searchParams.toString()
        );
      }
    } else if (!isEmpty(hideParam)) {
      reconciledHiddenEntities = hideParam.split(",").map(decodeURIComponent);
    }

    let reconciledHighlightedEntities;
    const [highlightParams, nonHighlightParams] = partition(function(
      [key, value]
    ) {
      return Validator.isColor(key);
    }, Array.from(searchParams));

    if (!isEmpty(highlightedEntities)) {
      reconciledHighlightedEntities = highlightedEntities;

      if (!isEmpty(highlightParams)) {
        console.warn(`Warning: "highlightedEntities" was specified by two different sources, which may or may not conflict.
		prop passed to Kaavio class:
			highlightedEntities={${JSON.stringify(highlightedEntities)}}
		URL query params:
			${JSON.stringify(highlightParams)}
		Setting URL query params to match prop passed to Kaavio class.`);

        const updatedParams = new URLSearchParams();
        [
          ...nonHighlightParams,
          ...toPairs(
            reduce(
              function(acc, { target, color }) {
                acc[color] = acc[color] || [];
                acc[color].push(target);
                return acc;
              },
              {},
              highlightedEntities
            )
          ).map(function([color, targets]) {
            return [color, targets.join()];
          })
        ].forEach(function([name, value]) {
          updatedParams.set(name, value);
        });

        history.replaceState(
          { highlightedEntities: highlightedEntities },
          document.title,
          "?" + updatedParams.toString()
        );
      }
    } else if (!isEmpty(highlightParams)) {
      reconciledHighlightedEntities = toPairs(
        highlightParams.reduce(function(acc, [color, targetString]) {
          targetString
            .split(",")
            .map(decodeURIComponent)
            .forEach(function(target) {
              if (!acc.hasOwnProperty(target)) {
                acc[target] = color;
              }
            });
          return acc;
        }, {})
      ).map(function([target, color]) {
        return { target, color };
      });
    }

    this.state = {
      diagramRef: null,
      hiddenEntities: reconciledHiddenEntities,
      highlightedEntities: reconciledHighlightedEntities
    };
  }

  onPanZoomReady = panZoom => {
    // Fire the onReady function with a reference to Kaavio
    const { onReady } = this.props;
    onReady(this);
  };

  handleClick = e => {
    const { onEntityClick } = this.props;
    const entity = e.entity;
    if (onEntityClick && entity) onEntityClick(entity);
  };

  render() {
    const {
      entityMap,
      pathway,
      zoomedEntities,
      pannedEntities,
      zoomLevel,
      panCoordinates,
      onPanZoomChange,
      showPanZoomControls = true,
      panZoomLocked = false
    } = this.props;

    const {
      highlightedEntities,
      hiddenEntities
      /*
      zoomedEntities,
      pannedEntities,
      zoomLevel,
      panCoordinates,
      showPanZoomControls = true,
      panZoomLocked = false
			//*/
    } = this.state;

    // TODO: Don't use refs!
    // Accessing the diagram ref from the state is a little bit of a hack to get panZoom working.
    // Consider refactoring the panZoom to be truly Reactive and not use refs
    return (
      <div
        id={`kaavio-container-for-${pathway.id}`}
        className={`kaavio-container ${kaavioStyle.Container}`}
      >
        <Diagram
          ref={diagram =>
            !this.state.diagramRef && this.setState({ diagramRef: diagram })}
          entityMap={entityMap}
          hiddenEntities={hiddenEntities}
          highlightedEntities={highlightedEntities}
          pathway={pathway}
          handleClick={this.handleClick}
          customStyle={customStyle}
          edgeDrawerMap={edgeDrawerMap}
          filterDrawerMap={filterDrawerMap}
          Icons={Icons}
          markerDrawerMap={markerDrawerMap}
        />
        <PanZoom
          diagram={this.state.diagramRef}
          zoomLevel={zoomLevel}
          panCoordinates={panCoordinates}
          zoomedEntities={zoomedEntities}
          pannedEntities={pannedEntities}
          onChange={onPanZoomChange}
          locked={panZoomLocked}
          onReady={this.onPanZoomReady}
          showPanZoomControls={showPanZoomControls}
        />
      </div>
    );
  }
}
